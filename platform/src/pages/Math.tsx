import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { playNaturalAudio } from '../utils/speech';
import TutorialOverlay from '../components/onboarding/TutorialOverlay';
import { useTranslate } from '../utils/i18n';

type Operation = '+' | '-' | '*' | '/';

const OPERATOR_WORDS: Record<string, Record<Operation, string>> = {
  'en': { '+': 'plus', '-': 'minus', '*': 'times', '/': 'divided by' },
  'fr': { '+': 'plus', '-': 'moins', '*': 'fois', '/': 'divisé par' },
  'de': { '+': 'plus', '-': 'minus', '*': 'mal', '/': 'geteilt durch' },
  'es': { '+': 'más', '-': 'menos', '*': 'por', '/': 'entre' },
  'it': { '+': 'più', '-': 'meno', '*': 'per', '/': 'diviso' },
  'pt': { '+': 'mais', '-': 'menos', '*': 'vezes', '/': 'dividido por' },
  'ru': { '+': 'плюс', '-': 'минус', '*': 'умножить на', '/': 'разделить на' },
  'hi': { '+': 'जमा', '-': 'घटा', '*': 'गुना', '/': 'भाग' },
  'ja': { '+': 'たす', '-': 'ひく', '*': 'かける', '/': 'わる' },
  'zh': { '+': '加', '-': '减', '*': '乘', '/': '除以' },
};

// Maps for converting Arabic digits → native script digits
const DEVANAGARI_DIGITS = ['०','१','२','३','४','५','६','७','८','९'];
const CJK_DIGITS = ['零','一','二','三','四','五','六','七','八','九'];

/** Convert a number to native-script digits for TTS so the engine stays in the target language */
function toNativeDigits(n: number, langCode: string): string {
  const s = String(n);
  switch (langCode) {
    case 'hi':
      return s.split('').map(c => /\d/.test(c) ? DEVANAGARI_DIGITS[parseInt(c)] : c).join('');
    case 'zh':
    case 'ja':
      // For single/double digits use Kanji; for larger numbers Arabic is fine (TTS handles it)
      if (n <= 10) return CJK_DIGITS[n] ?? s;
      return s; // TTS handles multi-digit Arabic with Chinese/Japanese context words
    default:
      return s; // Latin-script languages read Arabic digits natively
  }
}

function generateChallenge(activeOps: Operation[], minLimitRaw: number | '', maxLimitRaw: number | '', learningLang: string) {
  const minLimit = minLimitRaw === '' ? 1 : minLimitRaw;
  const maxLimit = maxLimitRaw === '' ? 10 : maxLimitRaw;
  const ops = activeOps.length > 0 ? activeOps : ['+'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer, visualEquation, speakText;

  const langCode = learningLang.split('-')[0].toLowerCase();
  const opWords = OPERATOR_WORDS[langCode] || OPERATOR_WORDS['en'];
  const nd = (n: number) => toNativeDigits(n, langCode);

  const min = Math.min(minLimit, maxLimit);
  const max = Math.max(minLimit, maxLimit);

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * (max - min + 1)) + min;
      b = Math.floor(Math.random() * (max - min + 1)) + min;
      answer = a + b;
      visualEquation = `${a} + ${b}`;
      speakText = `${nd(a)} ${opWords['+']} ${nd(b)}`;
      break;
    case '-':
      a = Math.floor(Math.random() * (max - min + 1)) + min + 10;
      b = Math.floor(Math.random() * (a - min + 1)) + min;
      answer = a - b;
      visualEquation = `${a} - ${b}`;
      speakText = `${nd(a)} ${opWords['-']} ${nd(b)}`;
      break;
    case '*':
      a = Math.floor(Math.random() * (Math.min(max, 15) - Math.min(min, 2) + 1)) + Math.min(min, 2);
      b = Math.floor(Math.random() * (Math.min(max, 15) - Math.min(min, 2) + 1)) + Math.min(min, 2);
      answer = a * b;
      visualEquation = `${a} × ${b}`;
      speakText = `${nd(a)} ${opWords['*']} ${nd(b)}`;
      break;
    case '/':
      b = Math.floor(Math.random() * (Math.min(max, 15) - Math.min(min, 2) + 1)) + Math.min(min, 2);
      answer = Math.floor(Math.random() * (max - min + 1)) + min;
      a = answer * b;
      visualEquation = `${a} ÷ ${b}`;
      speakText = `${nd(a)} ${opWords['/']} ${nd(b)}`;
      break;
    default:
      a = 1; b = 1; answer = 2; visualEquation = '1+1'; speakText = `${nd(1)} ${opWords['+']} ${nd(1)}`;
  }

  return { equation: visualEquation, answer: String(answer), speakText };
}

export default function MathBlock() {
  const { learningLang, activeLang, addCoins } = useAppContext();
  const t = useTranslate(activeLang);

  const [activeOps, setActiveOps] = useState<Operation[]>(['+', '-', '*', '/']);
  const [minLimit, setMinLimit] = useState<number | ''>(1);
  const [maxLimit, setMaxLimit] = useState<number | ''>(10);

  const [sessionStreak, setSessionStreak] = useState(0);
  const [currentQ, setCurrentQ] = useState(() => generateChallenge(activeOps, minLimit, maxLimit, learningLang));
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<null | 'correct' | 'incorrect'>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);


  useEffect(() => {
    setCurrentQ(generateChallenge(activeOps, minLimit, maxLimit, learningLang));
    setSessionStreak(0);
    setUserAnswer('');
    setIsRevealed(false);
    setFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOps]);

  useEffect(() => {
    setIsRevealed(false);
    setFeedback(null);
    setUserAnswer('');
  }, [currentQ.equation]);

  const playAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAudioProgress(0);
    playNaturalAudio(
      currentQ.speakText, learningLang,
      () => { setIsPlaying(true); setAudioProgress(5); },
      (p) => setAudioProgress(p),
      () => { setAudioProgress(100); setTimeout(() => { setIsPlaying(false); setAudioProgress(0); }, 500); }
    );
  };

  const handleInputFocus = () => playAudio();



  const handleSubmit = (directValue?: string) => {
    const attempt = (directValue !== undefined ? directValue : userAnswer).trim();
    if (!attempt && !isRevealed) return;

    if (isRevealed && !attempt) {
      setUserAnswer('');
      setIsRevealed(false);
      setCurrentQ(generateChallenge(activeOps, minLimit, maxLimit, learningLang));
      return;
    }

    if (attempt === currentQ.answer) {
      setFeedback('correct');
      setIsRevealed(true);
      addCoins(5);
      playNaturalAudio(currentQ.answer, learningLang, undefined, undefined, () => {
        setTimeout(() => {
          setFeedback(null);
          setUserAnswer('');
          setSessionStreak(s => s + 1);
          setCurrentQ(generateChallenge(activeOps, minLimit, maxLimit, learningLang));
        }, 800);
      });
    } else {
      setFeedback('incorrect');
      setSessionStreak(0);
    }
  };

  const nextQuestion = () => {
    setCurrentQ(generateChallenge(activeOps, minLimit, maxLimit, learningLang));
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-background font-body text-on-surface animate-in fade-in duration-700 pt-16">

      <TutorialOverlay
        pageId="math"
        title="Math Sprint"
        description="Configure your arithmetic ranges, hear the problem spoken natively, and type in the solution."
        icon="calculate"
      />

      {/* Ambient Particle Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb absolute w-[40%] h-[40%] bg-[rgb(251,146,60)] opacity-[0.08]"
          style={{ top: '10%', left: '-5%', '--dur': '16s', '--tx': '30px', '--ty': '-40px' } as React.CSSProperties} />
        <div className="ambient-orb absolute w-[35%] h-[35%] bg-primary opacity-[0.05]"
          style={{ top: '50%', right: '-10%', '--dur': '12s', '--tx': '-40px', '--ty': '20px' } as React.CSSProperties} />
      </div>

      <header className="relative z-10 w-full max-w-5xl mx-auto px-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 max-w-md w-full glass-panel px-6 py-4 rounded-3xl">
          <div className="flex justify-between font-label text-xs font-bold text-on-surface-variant mb-2">
            <span>{t('Sprint Progress')}</span>
            <span>{Math.min(sessionStreak * 10, 100)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff9800] to-[#fb8c00] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,152,0,0.5)]"
              style={{ width: `${Math.min(sessionStreak * 10, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant font-label font-medium glass-panel px-6 py-4 rounded-3xl">
          <span className="text-sm border-r border-outline-variant/30 pr-4 text-[#ff9800] font-bold">🔥 {sessionStreak} {t('streak')}</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-inverse-primary shadow-inner">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 mt-8 pb-24">

        {/* Settings Deck — responsive two-section layout */}
        <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-3 mb-4 z-20">
          {/* Operation toggles */}
          <div className="sm:flex-1 glass-panel p-3 rounded-3xl flex gap-2">
            {(['+', '-', '*', '/'] as Operation[]).map(op => (
              <button key={op}
                onClick={() => {
                  if (activeOps.includes(op) && activeOps.length > 1) setActiveOps(activeOps.filter(o => o !== op));
                  else if (!activeOps.includes(op)) setActiveOps([...activeOps, op]);
                }}
                className={`flex-1 py-2 rounded-2xl font-bold text-lg transition-all ${activeOps.includes(op)
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
              >
                {op === '*' ? '×' : op === '/' ? '÷' : op}
              </button>
            ))}
          </div>
          {/* Min / Max inputs */}
          <div className="sm:flex-1 grid grid-cols-2 gap-3 glass-panel p-3 rounded-3xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest px-2">{t('Min')}</span>
              <input type="number" value={minLimit} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') setMinLimit('');
                  else setMinLimit(Math.max(1, parseInt(val)));
                }}
                onBlur={() => {
                  const currentMin = minLimit === '' ? 1 : minLimit;
                  const currentMax = maxLimit === '' ? 10 : maxLimit;
                  setCurrentQ(generateChallenge(activeOps, currentMin, currentMax, learningLang));
                  setUserAnswer('');
                  setFeedback(null);
                  setSessionStreak(0);
                }}
                className="w-full px-3 py-2 rounded-2xl bg-surface-container-low dark:bg-white/5 border border-outline-variant/30 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary font-bold text-on-surface text-center transition-all" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest px-2">{t('Max')}</span>
              <input type="number" value={maxLimit} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') setMaxLimit('');
                  else setMaxLimit(Math.min(10000, Math.max(1, parseInt(val))));
                }}
                onBlur={() => {
                  const currentMin = minLimit === '' ? 1 : minLimit;
                  const currentMax = maxLimit === '' ? 10 : maxLimit;
                  setCurrentQ(generateChallenge(activeOps, currentMin, currentMax, learningLang));
                  setUserAnswer('');
                  setFeedback(null);
                  setSessionStreak(0);
                }}
                className="w-full px-3 py-2 rounded-2xl bg-surface-container-low dark:bg-white/5 border border-outline-variant/30 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary font-bold text-on-surface text-center transition-all" />
            </div>
          </div>
        </div>

        {/* Central Math Card — slides in on new question */}
        <div key={currentQ.equation} className="card-slide-enter w-full max-w-3xl glass-panel-heavy rounded-3xl shadow-[0_32px_64px_rgba(26,28,28,0.08)] p-6 md:p-12 flex flex-col items-center text-center border border-white/40 relative overflow-hidden min-h-[420px] md:min-h-[460px]">

          {/* Audio Visualization */}
          <div className="w-full flex flex-col items-center gap-6 mb-4">
            <button
              onClick={playAudio}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 group shadow-xl ${isPlaying ? 'bg-gradient-to-tr from-[#ff9800] to-[#fb8c00] text-white scale-105 shadow-orange-500/30' : 'glass-panel text-[#ff9800] hover:scale-105 border border-white/30 hover:bg-white/90'
                }`}
            >
              <span className="material-symbols-outlined text-5xl drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'graphic_eq' : 'play_arrow'}
              </span>
            </button>
            <div className="h-1.5 w-32 bg-surface-container-high/50 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-[#ff9800] transition-all duration-100 rounded-full shadow-[0_0_8px_rgba(255,152,0,0.6)]" style={{ width: `${audioProgress}%` }}></div>
            </div>
          </div>

          <form className="w-full flex-1 flex flex-col justify-center space-y-8" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <div className="relative group max-w-xl mx-auto flex flex-col items-center">

              {!isRevealed ? (
                <div className="cursor-pointer group flex flex-col items-center gap-2 mb-6 hover:opacity-100 opacity-60 transition-opacity" onClick={() => setIsRevealed(true)}>
                  <span className="material-symbols-outlined text-4xl">visibility_off</span>
                  <span className="font-label text-xs font-bold tracking-widest uppercase">{t('Tap to Reveal Equation')}</span>
                </div>
              ) : (
                <div className="font-mono font-bold text-[clamp(2.5rem,8vw,5rem)] text-on-surface tracking-tighter leading-none mb-6 animate-in fade-in zoom-in-95 text-transparent bg-clip-text bg-gradient-to-br from-on-surface to-on-surface-variant drop-shadow-sm">
                  {currentQ.equation}
                </div>
              )}

              <div className="w-full max-w-md mx-auto">
                <input
                  autoFocus
                  type="number"
                  value={userAnswer}
                  onFocus={handleInputFocus}
                  onChange={e => { setUserAnswer(e.target.value); setFeedback(null); }}
                  className={`w-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border-2 rounded-3xl px-8 py-4 text-center text-3xl md:text-5xl font-headline font-bold text-on-surface placeholder:text-surface-container-highest transition-all shadow-inner focus:outline-none ${feedback === 'correct' ? 'border-primary bg-primary/5 text-primary dark:text-inverse-primary' :
                    feedback === 'incorrect' ? 'border-error bg-error/5 text-error' :
                      'border-outline-variant/50 dark:border-white/10 focus:border-[#fb8c00] focus:bg-white focus:dark:bg-white/10'
                    }`}
                  placeholder="?"
                  readOnly={feedback === 'correct'}
                />
              </div>

              {/* Feedback Message */}
              <div className={`h-16 w-full mt-4 flex flex-col items-center justify-center text-center font-label font-bold text-sm transition-all duration-300 ${feedback ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {feedback === 'correct' && <span className="text-primary dark:text-inverse-primary bg-primary/10 px-6 py-2 rounded-full border border-primary/20 shadow-sm">{t('🎉 Correct')}</span>}
                {feedback === 'incorrect' && (
                  <span className="text-error flex flex-col items-center bg-error/5 px-6 py-2 rounded-2xl border border-error/20 shadow-sm">
                    <span>{t('Incorrect')}</span>
                    <span className="text-error/80 mt-0.5 text-xs">Answer: {currentQ.answer}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 mt-auto">
              <button
                type="button"
                onClick={nextQuestion}
                className="px-8 py-3.5 rounded-3xl glass-panel text-on-surface-variant font-label font-bold hover:text-on-surface transition-all hover:scale-[1.02] active:scale-95 text-sm"
              >
                {t('Skip')}
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-3xl font-label font-bold text-base hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_12px_24px_rgba(99,14,212,0.25)] border border-white/20"
              >
                {t('Check')} <span className="font-serif">→</span>
              </button>
            </div>
          </form>

        </div>
      </main>

    </div>
  );
}
