import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

import { playNaturalAudio } from '../utils/speech';
import { useTranslate } from '../utils/i18n';
import TutorialOverlay from '../components/onboarding/TutorialOverlay';
import { buildSessionQueue, recordAnswer, inferQuality, getDeckStats, type SRSPhrase } from '../utils/srs';

export default function Dictation() {
  const { learningLang, activeLang, recordAttempt, totalCorrect, totalAttempts, addCoins } = useAppContext();
  const t = useTranslate(activeLang);

  const [dynamicPhrases, setDynamicPhrases] = useState<SRSPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dynamic dictation data
  useEffect(() => {
    if (!learningLang) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      const langCode = learningLang.split('-')[0].toLowerCase();
      try {
        // Try to load from dict_[lang].json
        const data = await import(`../data/dictation/dict_${langCode}.json`);
        const phrases = data.default.map((item: any) => {
          // Pick translation based on activeLang (interface language)
          // Default to 'en' if not found
          const targetLang = activeLang.split('-')[0].toLowerCase();
          const translation = item.translations[targetLang] || item.translations['en'] || Object.values(item.translations)[0];
          return {
            term: item.term,
            translation: translation,
            romanization: item.romanization
          };
        });
        setDynamicPhrases(phrases);
      } catch (err) {
        console.warn(`Could not load dynamic dictation data for ${langCode}, falling back to static data.`, err);
        setDynamicPhrases([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [learningLang, activeLang]);

  const allPhrases = dynamicPhrases;

  // SRS queue built once per language change — rebuild when lang changes
  const [queue, setQueue] = useState<SRSPhrase[]>(() => buildSessionQueue(learningLang, allPhrases));
  const [queueIdx, setQueueIdx] = useState(0);

  const [userAnswer, setUserAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [feedback, setFeedback] = useState<null | 'correct' | 'incorrect' | 'missing_accents'>(null);
  const [sessionCount, setSessionCount] = useState(0);

  // SRS stats panel
  const [deckStats, setDeckStats] = useState(() => getDeckStats(learningLang, allPhrases));
  const [showStats, setShowStats] = useState(false);

  // Rebuild queue when language changes
  useEffect(() => {
    const newQueue = buildSessionQueue(learningLang, allPhrases);
    setQueue(newQueue);
    setQueueIdx(0);
    setUserAnswer('');
    setFeedback(null);
    setDeckStats(getDeckStats(learningLang, allPhrases));
  }, [learningLang, allPhrases]);

  // Current phrase
  const currentQ = queue.length > 0 ? queue[queueIdx % queue.length] : { term: '', translation: '' };

  // Auto-play audio when card changes
  useEffect(() => {
    setIsRevealed(false);
    setFeedback(null);

    if (!currentQ.term) return;

    const timer = setTimeout(() => {
      playNaturalAudio(
        currentQ.term, learningLang,
        () => setIsPlaying(true),
        undefined,
        () => { setTimeout(() => setIsPlaying(false), 500); }
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [queueIdx, learningLang, currentQ.term]);

  const handleInputFocus = useCallback(() => {
    playAudio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ.term, learningLang]);

  const playAudio = useCallback(() => {
    playNaturalAudio(
      currentQ.term, learningLang,
      () => setIsPlaying(true),
      undefined,
      () => { setTimeout(() => setIsPlaying(false), 500); }
    );
  }, [currentQ.term, learningLang]);



  const advanceCard = useCallback(() => {
    setUserAnswer('');
    setIsRevealed(false);
    setFeedback(null);
    setQueueIdx(i => i + 1);
  }, []);

  // Languages that use non-Latin scripts — accept English translation as valid answer
  const NON_LATIN_LANGS = ['hi', 'zh', 'ja', 'ru'];
  const isNonLatin = NON_LATIN_LANGS.includes(learningLang.split('-')[0].toLowerCase());

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() && !isRevealed) return;
    
    if (isRevealed) {
      // User gave up or is skipping after reveal
      recordAnswer(learningLang, currentQ.term, currentQ.translation, 1);
      setDeckStats(getDeckStats(learningLang, allPhrases));
      advanceCard();
      return;
    }

    // Normalize: strip punctuation, collapse whitespace, lowercase
    const norm = (s: string) => s.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
    // Strip all diacritical marks (accents) for lenient comparison
    const stripAcc = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const u = norm(userAnswer);
    const c = norm(currentQ.term);
    const tr = norm(currentQ.translation);
    const rom = currentQ.romanization ? norm(currentQ.romanization) : '';

    let result: 'correct' | 'incorrect' | 'missing_accents' = 'incorrect';

    // Exact match on term or translation
    if (u === c || u === tr) {
      result = 'correct';
    }
    // Match on romanization (e.g. "mem" for "में", "ka" for "का")
    else if (rom && u === rom) {
      result = 'correct';
    }
    // For non-Latin scripts: accept the English translation as correct
    // This lets users type "of" for "का" (Hindi), "no" for "の" (Japanese), etc.
    else if (isNonLatin && u === norm(currentQ.translation)) {
      result = 'correct';
    }
    // Accent-stripped match — for French "a" matches "à", etc.
    // Treat as correct (not just "missing_accents") for a friendlier UX
    else if (stripAcc(u) === stripAcc(c) || stripAcc(u) === stripAcc(tr)) {
      result = 'correct';
    }
    // Accent-stripped romanization match
    else if (rom && stripAcc(u) === stripAcc(rom)) {
      result = 'correct';
    }

    // ── SM-2 quality inference ──────────────────────────────────────
    const q = inferQuality(userAnswer, currentQ.term);
    recordAnswer(learningLang, currentQ.term, currentQ.translation, q);
    setDeckStats(getDeckStats(learningLang, allPhrases));
    // ───────────────────────────────────────────────────────────────

    setFeedback(result);
    const isCorrect = result === 'correct';
    recordAttempt(result !== 'incorrect');

    if (isCorrect) {
      setIsRevealed(true);
      setSessionCount(c => c + 1);
      addCoins(10);
      playNaturalAudio(currentQ.term, learningLang, undefined, undefined, () => {
        setTimeout(() => advanceCard(), 800);
      });
    } else {
      if (result === 'incorrect') {
        setIsRevealed(true);
      }
    }
  };

  const totalPrecision = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-background font-body text-on-surface animate-in fade-in duration-700 pt-16">

      <TutorialOverlay
        pageId="dictation"
        title="Dictation Studio"
        description="Listen to the native speaker and type exactly what you hear. Cards repeat based on how well you remember them."
        icon="mic"
      />

      {/* Ambient Particle Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb absolute w-[45%] h-[45%] bg-primary opacity-[0.1]"
          style={{ top: '-5%', left: '-8%', '--dur': '14s', '--tx': '30px', '--ty': '-25px' } as React.CSSProperties} />
        <div className="ambient-orb absolute w-[30%] h-[30%] bg-tertiary opacity-[0.08]"
          style={{ top: '55%', right: '-12%', '--dur': '10s', '--tx': '-20px', '--ty': '15px' } as React.CSSProperties} />
        <div className="ambient-orb absolute w-[20%] h-[20%] bg-primary opacity-[0.06]"
          style={{ top: '30%', left: '60%', '--dur': '18s', '--tx': '15px', '--ty': '-30px' } as React.CSSProperties} />
      </div>

      {/* Header Info */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 max-w-md w-full glass-panel px-6 py-4 rounded-3xl">
          <div className="flex justify-between font-label text-xs font-bold text-on-surface-variant mb-2">
            <span>{t('Overall Precision')}</span>
            <span>{totalPrecision}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,14,212,0.5)]"
              style={{ width: `${totalPrecision}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant font-label font-medium glass-panel px-6 py-4 rounded-3xl">
          <span className="text-sm border-r border-outline-variant/30 pr-4">{t('Session')}: {sessionCount} {t('correct')}</span>
          {/* SRS Stats Toggle */}
          <button
            onClick={() => setShowStats(v => !v)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-inverse-primary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-sm">psychology</span>
            <span>{deckStats.due} due · {deckStats.mastered} mastered</span>
          </button>
          <div className="flex items-center gap-2">
            <span>{t('Card')} {queueIdx % queue.length + 1} / {queue.length}</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-inverse-primary shadow-inner border border-primary/20">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
          </div>
        </div>
      </header>

      {/* SRS Stats Panel */}
      {showStats && (
        <div className="relative z-20 w-full max-w-5xl mx-auto px-8 mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 glass-panel-heavy rounded-3xl border border-white/40 shadow-xl">
            {[
              { label: t('Total Words'), value: deckStats.total, icon: 'library_books', color: 'text-on-surface' },
              { label: t('Due Now'), value: deckStats.due, icon: 'schedule', color: 'text-[#fb8c00]' },
              { label: t('Mastered'), value: deckStats.mastered, icon: 'emoji_events', color: 'text-primary dark:text-inverse-primary' },
              { label: t('Accuracy'), value: `${deckStats.accuracy}%`, icon: 'target', color: 'text-[#10B981]' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center gap-2 p-4 bg-white/40 rounded-2xl border border-white/50 shadow-inner">
                <span className={`material-symbols-outlined text-2xl ${stat.color} drop-shadow-sm`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                <span className={`font-headline text-3xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="font-label text-sm font-bold text-primary animate-pulse uppercase tracking-widest">{t('Loading Dictionary...')}</p>
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 mt-16 md:mt-24 pb-24">
        {/* The Central Task Card — slides in on each new card */}
        <div
          key={queueIdx}
          className="card-slide-enter w-full max-w-3xl glass-panel-heavy rounded-3xl shadow-[0_32px_64px_rgba(26,28,28,0.08)] p-8 md:p-16 flex flex-col items-center text-center border border-white/40 relative">

          <span className="font-label text-xs uppercase tracking-widest text-primary dark:text-inverse-primary font-bold mb-8 bg-primary/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-primary/20">{t('Dictation Studio')}</span>

          {/* Audio Control */}
          <div className="flex flex-col items-center gap-6 mb-12 w-full">
            <button
              onClick={playAudio}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 group shadow-xl ${
                isPlaying ? 'bg-gradient-to-tr from-[#ff9800] to-[#fb8c00] text-white scale-105 shadow-orange-500/30' : 'glass-panel text-[#ff9800] hover:scale-105 border border-white/30 hover:bg-white/90'
              }`}
            >
              <span className="material-symbols-outlined text-5xl drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'graphic_eq' : 'play_arrow'}
              </span>
            </button>
            <div className="h-1.5 w-full max-w-xs bg-surface-container-high/50 rounded-full overflow-hidden mt-6 shadow-inner">
              <div className="h-full bg-[#ff9800] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(255,152,0,0.6)]" style={{ width: `${isPlaying ? 100 : 0}%` }}></div>
            </div>
          </div>

          {/* Dictation Input */}
          <form className="w-full flex-1 flex flex-col justify-center space-y-8" onSubmit={handleCheck}>
            <div className="relative group max-w-2xl mx-auto flex flex-col items-center w-full">
              {!isRevealed ? (
                <div className="cursor-pointer group flex flex-col items-center gap-2 mb-6 hover:opacity-100 opacity-60 transition-opacity" onClick={() => setIsRevealed(true)}>
                  <span className="material-symbols-outlined text-4xl">visibility_off</span>
                  <span className="font-label text-xs font-bold tracking-widest uppercase">{t('Tap to Reveal')}</span>
                </div>
              ) : (
                <div className="font-serif text-xl md:text-2xl font-bold text-primary dark:text-inverse-primary animate-in fade-in zoom-in-95 mb-6 text-center drop-shadow-sm flex flex-wrap items-center justify-center gap-2">
                  <span>{currentQ.term}</span>
                  {currentQ.romanization && <span className="text-secondary font-medium font-body italic">({currentQ.romanization})</span>}
                  <span className="text-on-surface-variant font-medium font-body">({currentQ.translation})</span>
                </div>
              )}

              <div className="relative w-full">
                <input
                  autoFocus
                  type="text"
                  value={userAnswer}
                  onFocus={handleInputFocus}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className={`w-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border-2 rounded-3xl px-8 py-4 text-center text-2xl md:text-4xl font-headline font-bold text-on-surface placeholder:text-surface-container-highest transition-all shadow-inner focus:outline-none ${
                    feedback === 'correct' ? 'border-primary bg-primary/5 text-primary dark:text-inverse-primary' :
                    feedback === 'incorrect' ? 'border-error bg-error/5 text-error' :
                    feedback === 'missing_accents' ? 'border-amber-500 bg-amber-500/5 text-amber-600' :
                    'border-outline-variant/50 dark:border-white/10 focus:border-primary focus:bg-white focus:dark:bg-white/10'
                  }`}
                  placeholder={isNonLatin ? t('Type English or romanization...') : t('Type what you hear...')}
                  readOnly={feedback === 'correct'}
                />
                {isNonLatin && !feedback && (
                  <div className="absolute -bottom-6 left-0 right-0 text-center">
                    <span className="text-[10px] text-on-surface-variant font-medium opacity-70">
                      💡 Type the English meaning or romanization (e.g. "ka" for "का")
                    </span>
                  </div>
                )}
              </div>

              {/* Feedback Message */}
              <div className={`h-16 w-full mt-4 flex flex-col items-center justify-center text-center font-label font-bold text-sm transition-all duration-300 ${feedback ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {feedback === 'correct' && <span className="text-primary dark:text-inverse-primary bg-primary/10 px-6 py-2 rounded-full border border-primary/20 shadow-sm">{t('🎉 Perfect transcription')}</span>}
                {feedback === 'missing_accents' && <span className="text-amber-600 bg-amber-500/10 px-6 py-2 rounded-full border border-amber-500/20 shadow-sm">{t('Almost! Missing accents/punctuation.')}</span>}
                {feedback === 'incorrect' && (
                  <span className="text-error flex flex-col items-center bg-error/5 px-6 py-2 rounded-2xl border border-error/20 shadow-sm">
                    <span>{t('Incorrect')}</span>
                    <span className="text-error/80 mt-0.5 text-xs">Answer: {currentQ.term}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 mt-auto">
              <button
                type="button"
                onClick={advanceCard}
                className="px-8 py-3.5 rounded-3xl glass-panel text-on-surface-variant font-label font-bold hover:text-on-surface transition-all hover:scale-[1.02] active:scale-95 text-sm"
              >
                {t('Skip')}
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-3xl font-label font-bold text-base hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_12px_24px_rgba(99,14,212,0.25)] border border-white/20"
              >
                {isRevealed ? t('Next') : t('Verify')} <span className="font-serif">→</span>
              </button>
            </div>
          </form>

        </div>

        {/* Supportive Hints */}
        <div className="mt-16 w-full max-w-3xl flex justify-between items-start opacity-70 hover:opacity-100 transition-opacity">
          <div className="w-1/2 text-left pr-8">
            <h3 className="font-headline text-lg text-on-surface-variant mb-2">{t("Editor's Tip")}</h3>
            <p className="font-body text-sm text-secondary leading-relaxed font-medium">
              {t('Cards you find difficult will repeat more frequently. Cards you master will appear less often — this is spaced repetition at work.')}
            </p>
          </div>
          <div className="w-1/2 flex flex-col items-end gap-3 pt-2">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">keyboard_return</span>
              <span className="text-xs font-label">{t('Enter to Verify')}</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">psychology</span>
              <span className="text-xs font-label">{t('SM-2 Spaced Repetition')}</span>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
