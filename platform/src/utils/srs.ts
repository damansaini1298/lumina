/**
 * Spaced Repetition System (SM-2 Algorithm)
 * Persists via localStorage, keyed per-language.
 *
 * Card quality (q):
 *   5 – Perfect recall
 *   4 – Correct with slight hesitation
 *   3 – Correct but very hard
 *   2 – Wrong, but answer felt familiar
 *   1 – Wrong
 *   0 – Blackout
 */

export interface CardRecord {
  term: string;
  translation: string;
  /** Ease factor (≥1.3). Default 2.5 */
  ef: number;
  /** Interval in days until next review */
  interval: number;
  /** Repetition count */
  reps: number;
  /** Timestamp (ms) of next scheduled review */
  nextReview: number;
  /** Total correct */
  correct: number;
  /** Total seen */
  seen: number;
}

const STORAGE_KEY = (lang: string) => `srs_deck_${lang}`;

// ─── Persistence ───────────────────────────────────────────────────────────────

export function loadDeck(lang: string): Record<string, CardRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(lang));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDeck(lang: string, deck: Record<string, CardRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY(lang), JSON.stringify(deck));
  } catch {
    // Storage full – silently continue
  }
}

// ─── SM-2 Core ─────────────────────────────────────────────────────────────────

/**
 * Update a card record after a review.
 * @param card   Existing record (or undefined for new card)
 * @param q      Quality of recall [0-5]
 */
export function sm2Update(
  card: CardRecord | undefined,
  term: string,
  translation: string,
  q: number
): CardRecord {
  const now = Date.now();

  if (!card) {
    // New card — create with default values
    card = {
      term,
      translation,
      ef: 2.5,
      interval: 1,
      reps: 0,
      nextReview: now,
      correct: 0,
      seen: 0,
    };
  }

  const updated: CardRecord = { ...card, seen: card.seen + 1 };

  if (q < 3) {
    // Failed — reset repetitions, re-show soon
    updated.reps = 0;
    updated.interval = 1;
    updated.correct = card.correct;
  } else {
    // Passed
    updated.correct = card.correct + 1;
    if (card.reps === 0) {
      updated.interval = 1;
    } else if (card.reps === 1) {
      updated.interval = 6;
    } else {
      updated.interval = Math.round(card.interval * card.ef);
    }
    updated.reps = card.reps + 1;
  }

  // Update ease factor
  updated.ef = Math.max(
    1.3,
    card.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  // Schedule next review
  updated.nextReview = now + updated.interval * 24 * 60 * 60 * 1000;

  return updated;
}

// ─── Queue Builder ─────────────────────────────────────────────────────────────

export interface SRSPhrase {
  term: string;
  translation: string;
}

/**
 * Returns an ordered list of phrases for the current session.
 *
 * Priority:
 *   1. Due cards (nextReview ≤ now), sorted by longest-overdue first
 *   2. New cards never seen (up to `newCardLimit`)
 *
 * @param lang        Language code
 * @param allPhrases  Full phrase list for the language
 * @param newCardLimit How many new cards to introduce per session (default 20)
 */
export function buildSessionQueue(
  lang: string,
  allPhrases: SRSPhrase[],
  newCardLimit = 20
): SRSPhrase[] {
  const now = Date.now();
  const deck = loadDeck(lang);

  const due: CardRecord[] = [];
  const newPhrases: SRSPhrase[] = [];

  for (const phrase of allPhrases) {
    const record = deck[phrase.term];
    if (!record) {
      newPhrases.push(phrase);
    } else if (record.nextReview <= now) {
      due.push(record);
    }
  }

  // Sort due cards: most overdue first
  due.sort((a, b) => a.nextReview - b.nextReview);

  // Combine: all due + up to newCardLimit new cards
  const sessionPhrases: SRSPhrase[] = [
    ...due.map(r => ({ term: r.term, translation: r.translation })),
    ...newPhrases.slice(0, newCardLimit),
  ];

  // Shuffle new cards in with due cards using interleaving
  return sessionPhrases.length > 0 ? sessionPhrases : allPhrases.slice(0, 20);
}

/**
 * Record a user's answer quality and persist it.
 * @param lang       Language code
 * @param term       The phrase term (serves as the deck key)
 * @param translation  English translation
 * @param quality    SM-2 quality [0-5]
 */
export function recordAnswer(
  lang: string,
  term: string,
  translation: string,
  quality: number
): CardRecord {
  const deck = loadDeck(lang);
  const existing = deck[term];
  const updated = sm2Update(existing, term, translation, quality);
  deck[term] = updated;
  saveDeck(lang, deck);
  return updated;
}

/**
 * Infer SM-2 quality from a string comparison.
 *   Exact match → 5
 *   Close match (Levenshtein ≤ 2) → 4
 *   Case-insensitive exact → 4
 *   Wrong → 1
 */
export function inferQuality(userInput: string, correctTerm: string): number {
  const u = userInput.trim().toLowerCase();
  const c = correctTerm.trim().toLowerCase();

  if (u === c) return 5;
  if (levenshtein(u, c) <= 2) return 4;
  return 1;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

// ─── Statistics ─────────────────────────────────────────────────────────────────

export interface DeckStats {
  total: number;
  due: number;
  new: number;
  mastered: number; // interval ≥ 21 days
  accuracy: number; // 0-100
}

export function getDeckStats(lang: string, allPhrases: SRSPhrase[]): DeckStats {
  const now = Date.now();
  const deck = loadDeck(lang);
  const records = Object.values(deck);

  const seenSet = new Set(records.map(r => r.term));
  const newCount = allPhrases.filter(p => !seenSet.has(p.term)).length;
  const dueCount = records.filter(r => r.nextReview <= now).length;
  const masteredCount = records.filter(r => r.interval >= 21).length;

  const totalSeen = records.reduce((s, r) => s + r.seen, 0);
  const totalCorrect = records.reduce((s, r) => s + r.correct, 0);

  return {
    total: allPhrases.length,
    due: dueCount,
    new: newCount,
    mastered: masteredCount,
    accuracy: totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0,
  };
}
