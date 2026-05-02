import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import TutorialOverlay from '../components/onboarding/TutorialOverlay';
import { useTranslate } from '../utils/i18n';
import { SUPPORTED_LANGUAGES } from '../components/onboarding/LanguageModal';

// Generate last 7 days labels
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return { label: d.toLocaleDateString('default', { weekday: 'short' }).slice(0, 2), isToday: i === 6 };
});

const MODULE_CARDS = [
  {
    to: '/dictation',
    key: 'Dictation',
    icon: 'mic',
    subKey: 'Auditory Training',
    gradient: 'from-[#630ed4] via-[#7c3aed] to-[#6366f1]',
    glow: 'shadow-purple-900/40',
    bg: 'record_voice_over',
  },
  {
    to: '/math',
    key: 'Math Sprint',
    icon: 'calculate',
    subKey: 'Mental arithmetic.',
    gradient: 'from-[#f97316] to-[#ea580c]',
    glow: 'shadow-orange-900/30',
    bg: 'functions',
  },
  {
    to: '/language',
    key: 'Vocab Vault',
    icon: 'style',
    subKey: 'words to review.',
    gradient: 'from-[#10b981] to-[#059669]',
    glow: 'shadow-emerald-900/30',
    bg: 'auto_stories',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { activeLang, dayStreak, learningLang, interfaceLang, totalCorrect, totalAttempts, coins } = useAppContext();
  const t = useTranslate(activeLang);

  const learningName = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.name ?? 'English';
  const learningFlag = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.ccode ?? 'us';
  const precision    = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);
  const xp           = totalCorrect * 10;

  const [phrases, setPhrases] = useState<any[]>([]);

  useEffect(() => {
    const langCode = learningLang.split('-')[0];
    import(`../data/dictation/dict_${langCode}.json`).then((module) => {
      setPhrases(module.default);
    }).catch(() => setPhrases([]));
  }, [learningLang]);

  // Word of the day
  const nativeCode = interfaceLang.split('-')[0];
  const todayIndex   = new Date().getDate() % Math.max(phrases.length, 1);
  const wordOfDayData = phrases[todayIndex];
  const wordOfDay = wordOfDayData ? {
    term: wordOfDayData.term,
    translation: wordOfDayData.translations?.[nativeCode] || wordOfDayData.translations?.['en'] || ''
  } : undefined;

  // Animate on mount
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setBarVisible(true), 300); return () => clearTimeout(timer); }, []);

  return (
    <div className="relative min-h-[calc(100vh)] w-full">

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb absolute w-[45%] h-[45%] bg-primary opacity-[0.08]"
          style={{ top: '-10%', left: '-5%', '--dur': '18s', '--tx': '50px', '--ty': '-30px' } as React.CSSProperties} />
        <div className="ambient-orb absolute w-[30%] h-[30%] bg-[#10b981] opacity-[0.05]"
          style={{ top: '50%', right: '-5%', '--dur': '14s', '--tx': '-30px', '--ty': '40px' } as React.CSSProperties} />
        <div className="ambient-orb absolute w-[20%] h-[20%] bg-[#f97316] opacity-[0.04]"
          style={{ bottom: '10%', left: '30%', '--dur': '20s', '--tx': '20px', '--ty': '-20px' } as React.CSSProperties} />
      </div>

      <TutorialOverlay
        pageId="home"
        title="Welcome to Lumina Learning!"
        description="Your curated dashboard. Track your cognitive mastery and jump into targeted practice modes."
        icon="home"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src={`https://flagcdn.com/w40/${learningFlag}.png`} alt={learningName}
                className="w-8 h-8 rounded-full object-cover shadow-md ring-2 ring-primary/30" />
              <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                {learningName}
              </span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
              {t('Daily Insight')}
            </h1>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#f97316] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider leading-none mb-1">Streak</span>
                <span className="font-bold text-on-surface text-base leading-none">{dayStreak} {t('Days')}</span>
              </div>
            </div>

            <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider leading-none mb-1">Gems</span>
                <span className="font-bold text-on-surface text-base leading-none">{coins}</span>
              </div>
            </div>

            <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider leading-none mb-1">Accuracy</span>
                <span className="font-bold text-on-surface text-base leading-none">{precision}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Word of the Day Banner ─────────────────────────── */}
        <div className="w-full glass-panel-heavy rounded-3xl p-8 md:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700 -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Word of the Day</span>
              </div>

              {wordOfDay ? (
                <div>
                  <h2 className="font-headline text-5xl md:text-6xl font-bold text-on-surface tracking-tight mb-2 leading-none">
                    {wordOfDay.term ?? '—'}
                  </h2>
                  <p className="text-primary dark:text-inverse-primary text-xl md:text-2xl font-bold uppercase tracking-widest mt-4">
                    {wordOfDay.translation ?? ''}
                  </p>
                </div>
              ) : (
                <div className="text-on-surface-variant font-medium text-lg">Pick a language to begin</div>
              )}
            </div>

            {/* Session Stats */}
            <div className="w-full md:w-64 glass-panel bg-surface-container/50 rounded-2xl p-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-4">Your Progress</span>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-on-surface">Accuracy</span>
                    <span className="text-xs font-bold text-primary dark:text-inverse-primary">{precision}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000" style={{ width: barVisible ? `${precision}%` : '0%' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-xl bg-surface-container-high">
                  <div className="font-bold text-lg text-on-surface leading-none">{phrases.length > 0 ? phrases.length.toLocaleString() : '—'}</div>
                  <div className="text-[8px] text-on-surface-variant uppercase tracking-wide mt-0.5">Words</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-surface-container-high">
                  <div className="font-bold text-lg text-[#10b981] leading-none">{totalCorrect}</div>
                  <div className="text-[8px] text-on-surface-variant uppercase tracking-wide mt-0.5">Correct</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-surface-container-high">
                  <div className="font-bold text-lg text-on-surface leading-none">{totalAttempts}</div>
                  <div className="text-[8px] text-on-surface-variant uppercase tracking-wide mt-0.5">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Module Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODULE_CARDS.map(({ to, key, icon, subKey, gradient, glow, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`group text-left rounded-3xl p-8 shadow-xl ${glow} hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${gradient}`}
            >
              <div className="absolute -bottom-4 -right-4 opacity-[0.15] transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12">
                <span className="material-symbols-outlined text-9xl text-white block leading-none">{bg}</span>
              </div>

              <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner mb-auto">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">{t(subKey)}</p>
                  <h3 className="font-headline text-3xl font-bold text-white leading-tight mb-4">{t(key)}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm font-bold group-hover:text-white transition-colors">
                    <span>Start now</span>
                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Bottom Row: XP + Weekly Goal ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* XP Milestone */}
          <div className="glass-panel rounded-3xl p-8 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-5">
              <span className="material-symbols-outlined text-[150px]">workspace_premium</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-3xl text-primary dark:text-inverse-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">{t('Milestones')}</span>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{t('Total Experience')}</h3>
              <div className="font-headline text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                {xp.toLocaleString()} <span className="text-lg text-on-surface-variant font-bold">XP</span>
              </div>
            </div>
          </div>

          {/* Weekly Goal — Individual Day Circles */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Weekly Goal</span>
                <h3 className="font-headline text-xl font-bold text-on-surface">Practice Streak</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f97316]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#f97316] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
            </div>

            {/* 7-day circle grid */}
            <div className="flex items-center gap-2 mb-5">
              {WEEK_DAYS.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full aspect-square rounded-xl transition-all duration-500 flex items-center justify-center ${
                    i < dayStreak
                      ? 'bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_4px_12px_rgba(249,115,22,0.3)]'
                      : d.isToday
                        ? 'bg-surface-container-high border-2 border-[#f97316]/40 border-dashed'
                        : 'bg-surface-container-high'
                  }`}>
                    {i < dayStreak && (
                      <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                    {d.isToday && i >= dayStreak && (
                      <div className="w-2 h-2 rounded-full bg-[#f97316]/60 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[9px] font-bold ${d.isToday ? 'text-[#f97316]' : 'text-on-surface-variant opacity-50'}`}>{d.label}</span>
                </div>
              ))}
            </div>

            {/* Summary bar */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant font-medium">{dayStreak} / 7 days</span>
              <div className="h-1.5 flex-1 mx-4 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-full transition-all duration-1000" style={{ width: barVisible ? `${(Math.min(dayStreak, 7) / 7) * 100}%` : '0%' }} />
              </div>
              <span className="font-bold text-[#f97316]">{Math.round((Math.min(dayStreak, 7) / 7) * 100)}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
