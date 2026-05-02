import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { playNaturalAudio } from '../utils/speech';
import { SUPPORTED_LANGUAGES } from '../components/onboarding/LanguageModal';
import TutorialOverlay from '../components/onboarding/TutorialOverlay';
import { useTranslate } from '../utils/i18n';

export default function Language() {
  const { learningLang, interfaceLang, addCoins, activeLang } = useAppContext();
  const t = useTranslate(activeLang);
  const langName = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.name ?? 'English';

  const [QUESTIONS, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    const langCode = learningLang.split('-')[0];
    import(`../data/dictation/dict_${langCode}.json`).then((module) => {
      setQuestions(module.default);
    }).catch(() => setQuestions([]));
  }, [learningLang]);

  const nativeCode = interfaceLang.split('-')[0];
  const currentQData = QUESTIONS[currentIdx % Math.max(QUESTIONS.length, 1)];
  const currentQ = currentQData ? {
    term: currentQData.term,
    translation: currentQData.translations?.[nativeCode] || currentQData.translations?.['en'] || '',
    romanization: currentQData.romanization,
    type: currentQData.type
  } : undefined;
  const progress = QUESTIONS.length > 0 ? (currentIdx % QUESTIONS.length) / QUESTIONS.length : 0;

  const handleReveal = () => setShowAnswer(true);

  const handleResult = (knew: boolean) => {
    if (knew) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      addCoins(10);
    } else {
      setStreak(0);
    }
    setShowAnswer(false);
    setTimeout(() => {
      setCurrentIdx(i => i + 1);
    }, 400);
  };

  const playAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAudioProgress(0);
    playNaturalAudio(
      currentQ?.term, learningLang,
      () => { setIsPlaying(true); setAudioProgress(5); },
      (p) => setAudioProgress(p),
      () => { setAudioProgress(100); setTimeout(() => { setIsPlaying(false); setAudioProgress(0); }, 500); }
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-background font-body text-on-surface animate-in fade-in duration-700 pt-16">
      
      <TutorialOverlay
        pageId="language"
        title="Vocabulary Vault"
        description="Active recall. Reveal the flipside and rate your memory honestly."
        icon="style"
      />

      {/* Zen Mode Background Accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb absolute w-[40%] h-[40%] bg-[#10B981] opacity-[0.1]"
          style={{ top: '10%', left: '-5%', '--dur': '16s', '--tx': '30px', '--ty': '-40px' } as React.CSSProperties} />
        <div className="ambient-orb absolute w-[35%] h-[35%] bg-primary opacity-[0.08]"
          style={{ top: '50%', right: '-10%', '--dur': '12s', '--tx': '-40px', '--ty': '20px' } as React.CSSProperties} />
      </div>

      {/* Header Info */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 max-w-md w-full glass-panel px-6 py-4 rounded-3xl">
          <div className="flex justify-between font-label text-xs font-bold text-on-surface-variant mb-2">
            <span>{t('Deck Progress')}</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#10B981] to-[#34d399] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant font-label font-medium glass-panel px-6 py-4 rounded-3xl">
          <span className="text-sm border-r border-outline-variant/30 pr-4 text-[#ff9800] font-bold">🔥 {streak} {t('streak')}</span>
          <div className="flex items-center gap-2">
            <span className="text-primary dark:text-inverse-primary font-bold">+{score} {t('gems')}</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-inverse-primary shadow-inner">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 mt-12 md:mt-20 pb-24">
        {/* The Central Task Card — 3D flip */}
        <div
          className="flip-card w-full max-w-3xl min-h-[440px] cursor-pointer group"
          onClick={showAnswer ? playAudio : handleReveal}
        >
          <div className={`flip-card-inner w-full min-h-[440px] ${showAnswer ? 'flipped' : ''}`}>

            {/* ── Front face (English prompt) ── */}
            <div className="flip-face absolute inset-0 glass-panel-heavy rounded-3xl flex flex-col items-center justify-center p-12 text-center transition-transform duration-500">
              <div className="absolute top-6 right-6 bg-surface-container-high/50 backdrop-blur-md text-on-surface-variant text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest border border-white/20">
                {currentQ?.type || 'Phrase'}
              </div>
              <span className="absolute top-8 left-0 right-0 flex justify-center">
                <span className="font-label text-xs uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 backdrop-blur-md border border-[#10B981]/20 px-5 py-2 rounded-full font-bold">{t('Vocab Vault')}</span>
              </span>
              <p className="font-label text-sm uppercase tracking-widest mb-6 opacity-60 mt-8 font-bold text-on-surface-variant">
                {t('What is this in')} {langName}?
              </p>
              <h2
                className="font-headline font-bold text-on-surface leading-tight text-transparent bg-clip-text bg-gradient-to-br from-on-surface to-on-surface-variant drop-shadow-sm"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
              >
                {currentQ?.translation}
              </h2>
              <div className="absolute bottom-8 flex items-center gap-2 text-primary dark:text-inverse-primary font-bold text-sm animate-pulse bg-primary/5 px-6 py-2 rounded-full backdrop-blur-md border border-primary/10">
                <span className="material-symbols-outlined text-xl">flip</span>
                {t('Tap to reveal')}
              </div>
            </div>

            {/* ── Back face (native answer) ── */}
            <div className="flip-face flip-face-back absolute inset-0 bg-gradient-to-br from-primary to-primary-container text-white rounded-3xl shadow-[0_32px_64px_rgba(99,14,212,0.3)] border border-white/20 flex flex-col items-center justify-center p-12 text-center backdrop-blur-3xl transition-transform duration-500">
              {/* Audio button */}
              <div className="absolute top-8 right-8">
                <button onClick={playAudio}
                  className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-xl border border-white/20 ${isPlaying ? 'bg-white text-primary' : 'bg-white/20 text-white backdrop-blur-md'}`}
                >
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: `'FILL' ${isPlaying ? '1' : '0'}` }}>
                    {isPlaying ? 'graphic_eq' : 'volume_up'}
                  </span>
                </button>
              </div>
              <div className="flex flex-col items-center w-full mt-4">
                <h2 className="font-headline font-bold text-white leading-tight mb-4 drop-shadow-lg"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}>
                  {currentQ?.term}
                </h2>
                {currentQ?.romanization && (
                  <p className="font-body text-white/80 text-lg md:text-xl font-medium tracking-wide mb-2 italic">/{currentQ.romanization}/</p>
                )}
                <p className="font-body font-bold text-white/90 text-sm opacity-90 uppercase tracking-widest mt-6 pt-6 border-t border-white/20 w-1/2 text-center">{currentQ?.translation}</p>
              </div>
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10 rounded-b-3xl overflow-hidden">
                  <div className="h-full bg-white transition-all duration-100 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${audioProgress}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Controls */}
        <div className={`w-full max-w-3xl mt-8 grid grid-cols-2 gap-6 transition-all duration-500 ${showAnswer ? 'opacity-100 translate-y-0 relative z-20' : 'opacity-0 translate-y-8 pointer-events-none absolute'}`}>
          <button onClick={() => handleResult(false)}
            className="py-5 rounded-3xl font-bold font-label text-base cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] glass-panel text-on-surface-variant hover:text-on-surface text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">sentiment_dissatisfied</span> {t('Still learning')}
          </button>
          <button onClick={() => handleResult(true)}
            className="py-5 rounded-3xl font-bold font-label text-base cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-[0_12px_32px_rgba(16,185,129,0.3)] border border-white/20 text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> {t('Got it')} (+10)
          </button>
        </div>

      </main>
    </div>
  );
}
