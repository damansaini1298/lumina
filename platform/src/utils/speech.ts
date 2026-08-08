const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  de: ['de', 'german', 'deutsch'],
  fr: ['fr', 'french', 'français', 'francais'],
  es: ['es', 'spanish', 'español', 'espanol'],
  it: ['it', 'italian', 'italiano'],
  pt: ['pt', 'portuguese', 'português', 'portugues'],
  ru: ['ru', 'russian', 'русский'],
  hi: ['hi', 'hindi', 'हिन्दी'],
  ja: ['ja', 'japanese', '日本語'],
  zh: ['zh', 'chinese', '中文'],
  en: ['en', 'english'],
};

// Pre-warm voices on page load so they're available synchronously later
let _cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && window.speechSynthesis) {
  _cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    _cachedVoices = window.speechSynthesis.getVoices();
  });
}

export const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = _cachedVoices.length > 0 ? _cachedVoices : window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0].toLowerCase();
  const keywords = LANGUAGE_KEYWORDS[langPrefix] || [langPrefix];

  const matchingVoices = voices.filter(v => {
    const vLang = (v.lang || '').toLowerCase().replace('_', '-');
    const vName = (v.name || '').toLowerCase();
    if (vLang.startsWith(langPrefix)) return true;
    return keywords.some(kw => vLang.includes(kw) || vName.includes(kw));
  });

  if (matchingVoices.length === 0) return null;

  const naturalRegex = /(natural|online|premium|neural|google|siri|samantha|enhanced|apple|cortana)/i;
  return matchingVoices.find(v => naturalRegex.test(v.name)) || matchingVoices[0];
};

let currentAudio: HTMLAudioElement | null = null;
let currentInterval: any = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _globalUtterance: SpeechSynthesisUtterance | null = null; // GC prevention

/**
 * Play TTS audio for text in a given language.
 * 
 * Strategy: Try two Google TTS URLs in sequence, then WebSpeech.
 * The function is NOT async — audio.play() is called synchronously
 * to preserve Firefox's user-gesture autoplay token.
 */
export const playNaturalAudio = (
  text: string, 
  lang: string, 
  onStart?: () => void, 
  onBoundary?: (progress: number) => void, 
  onEnd?: () => void
) => {
  if (typeof window === 'undefined' || !text.trim()) return;

  // Clean up previous playback
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  window.speechSynthesis?.cancel();

  const tl = lang.split('-')[0].toLowerCase();

  // Build two Google TTS URLs to try (different domains/clients have different access policies)
  const urls = [
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${tl}&client=tw-ob`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(text)}`,
  ];

  tryAudioUrl(urls, 0, text, lang, onStart, onBoundary, onEnd);
};

/** Try to play an audio URL. On failure, try next URL or fall back to WebSpeech. */
function tryAudioUrl(
  urls: string[],
  index: number,
  text: string,
  lang: string,
  onStart?: () => void,
  onBoundary?: (progress: number) => void,
  onEnd?: () => void
) {
  if (index >= urls.length) {
    // All URLs failed — last resort: WebSpeech
    speakWithWebSpeech(text, lang, onStart, onBoundary, onEnd);
    return;
  }

  // Use new Audio(url) constructor — starts loading immediately and
  // inherits the page-level <meta name="referrer" content="no-referrer"> policy
  const audio = new Audio(urls[index]);
  currentAudio = audio;

  let settled = false;
  const onFail = () => {
    if (settled) return;
    settled = true;
    if (currentInterval) { clearInterval(currentInterval); currentInterval = null; }
    audio.pause();
    audio.src = '';
    // Try next URL
    tryAudioUrl(urls, index + 1, text, lang, onStart, onBoundary, onEnd);
  };

  audio.onplay = () => {
    settled = true; // success — don't let onerror fire later
    if (onStart) onStart();
    if (onBoundary) {
      currentInterval = setInterval(() => {
        if (audio.duration && audio.currentTime) {
          onBoundary((audio.currentTime / audio.duration) * 100);
        }
      }, 50);
    }
  };

  audio.onended = () => {
    if (currentInterval) { clearInterval(currentInterval); currentInterval = null; }
    if (onBoundary) onBoundary(100);
    if (onEnd) onEnd();
  };

  audio.onerror = onFail;

  // Play immediately — synchronous in user gesture context
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(onFail);
  }
}

/** WebSpeech fallback — fully synchronous, no awaits, preserves user gesture */
const speakWithWebSpeech = (
  text: string, 
  lang: string, 
  onStart?: () => void, 
  onBoundary?: (progress: number) => void, 
  onEnd?: () => void
) => {
  const synth = window.speechSynthesis;
  if (!synth) {
    if (onEnd) onEnd();
    return;
  }

  synth.cancel();

  const bestVoice = getBestVoice(lang);
  const utterance = new SpeechSynthesisUtterance(text);
  _globalUtterance = utterance;
  void _globalUtterance;

  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang || lang;
  } else {
    utterance.lang = lang;
  }

  utterance.rate = 0.95;

  let boundaryFired = false;
  let simulatedInterval: any = null;

  const clearTimer = () => {
    if (simulatedInterval) {
      clearInterval(simulatedInterval);
      simulatedInterval = null;
    }
  };

  utterance.onstart = () => {
    if (onStart) onStart();
    if (onBoundary) {
      const estimatedDurationMs = Math.max(1200, text.length * 90);
      const startTime = Date.now();
      simulatedInterval = setInterval(() => {
        if (boundaryFired) return;
        const elapsed = Date.now() - startTime;
        const pct = Math.min(95, (elapsed / estimatedDurationMs) * 100);
        onBoundary(pct);
      }, 50);
    }
  };

  utterance.onboundary = (e) => {
    boundaryFired = true;
    clearTimer();
    if (onBoundary) {
      onBoundary((e.charIndex / Math.max(text.length, 1)) * 100);
    }
  };

  const handleFinish = () => {
    clearTimer();
    if (onBoundary) onBoundary(100);
    if (onEnd) onEnd();
  };

  utterance.onend = handleFinish;
  utterance.onerror = handleFinish;

  synth.speak(utterance);
};
