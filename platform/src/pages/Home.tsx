import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import TutorialOverlay from '../components/onboarding/TutorialOverlay';
import { useTranslate } from '../utils/i18n';
import { SUPPORTED_LANGUAGES } from '../components/onboarding/LanguageModal';
import { LANGUAGE_DATA } from '../data/languages';

// Generate last 7 days labels
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return { label: d.toLocaleDateString('default', { weekday: 'short' }).slice(0, 2), isToday: i === 6 };
});

// Tiny sparkline data (simulated from totalCorrect)
const getSparkData = (total: number) => {
  const base = Math.max(total / 7, 1);
  return Array.from({ length: 7 }, (_, i) => Math.round(base * (0.4 + Math.random() * 0.8 + i * 0.05)));
};

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
  const { activeLang, dayStreak, learningLang, totalCorrect, totalAttempts, coins } = useAppContext();
  const t = useTranslate(activeLang);

  const learningName = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.name ?? 'English';
  const learningFlag = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.ccode ?? 'us';
  const phrases      = LANGUAGE_DATA[learningLang] || [];
  const precision    = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);
  const xp           = totalCorrect * 10;

  // Word of the day — pick based on today's date index
  const todayIndex   = new Date().getDate() % Math.max(phrases.length, 1);
  const wordOfDay    = phrases[todayIndex] as { term?: string; translation?: string } | undefined;

  const [sparkData] = useState(() => getSparkData(totalCorrect));
  const sparkMax = Math.max(...sparkData, 1);

  // Animate progress bar on mount
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarVisible(true), 300); return () => clearTimeout(t); }, []);

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

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex items-start justify-between mb-10 gap-4">
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
            <p className="text-on-surface-variant mt-1.5">
              {t('You are mastering')} <span className="font-bold text-primary dark:text-inverse-primary">{learningName}</span>.
            </p>
          </div>

          {/* Quick stats cluster */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f97316] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="font-bold text-on-surface text-sm">{dayStreak} {t('Days')}</span>
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
              <span className="font-bold text-on-surface text-sm">{coins}</span>
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
              <span className="font-bold text-on-surface text-sm">{precision}%</span>
            </div>
          </div>
        </header>

        {/* ── Main Bento Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">

          {/* Word of the Day — col 1-5 */}
          <div className="md:col-span-5 glass-panel-heavy rounded-3xl p-7 flex flex-col justify-between overflow-hidden relative group min-h-[200px]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Word of the Day</span>
              </div>

              {wordOfDay ? (
                <>
                  <div className="font-headline text-5xl font-bold text-on-surface tracking-tight mb-2 leading-none">
                    {wordOfDay.term ?? '—'}
                  </div>
                  <div className="text-on-surface-variant text-lg font-medium">
                    {wordOfDay.translation ?? ''}
                  </div>
                </>
              ) : (
                <div className="text-on-surface-variant font-medium">Pick a language to begin</div>
              )}
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000" style={{ width: barVisible ? '65%' : '0%' }} />
              </div>
              <span className="text-xs font-bold text-primary dark:text-inverse-primary">65%</span>
              <span className="text-xs text-on-surface-variant">mastered</span>
            </div>
          </div>

          {/* Streak + Sparkline — col 6-8 */}
          <div className="md:col-span-3 glass-panel rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative min-h-[200px]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('Consistency')}</span>
              <div className="flex items-end gap-2 mt-3">
                <span className="material-symbols-outlined text-[#f97316] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="font-headline text-5xl font-bold tracking-tighter leading-none">{dayStreak}</span>
                <span className="text-on-surface-variant font-medium mb-1">{t('Days')}</span>
              </div>
            </div>

            {/* Mini sparkline */}
            <div className="mt-4">
              <div className="flex items-end gap-1 h-12">
                {sparkData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm transition-all duration-700 ${WEEK_DAYS[i].isToday ? 'bg-primary dark:bg-inverse-primary' : 'bg-surface-container-highest'}`}
                      style={{ height: barVisible ? `${(val / sparkMax) * 100}%` : '4px', minHeight: '4px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                {WEEK_DAYS.map((d, i) => (
                  <span key={i} className={`flex-1 text-center text-[9px] font-bold ${d.isToday ? 'text-primary dark:text-inverse-primary' : 'text-on-surface-variant opacity-50'}`}>
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Accuracy ring — col 9-12 */}
          <div className="md:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between min-h-[200px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('Cognitive Sync')}</span>
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-xs font-bold text-primary dark:text-inverse-primary">{precision}%</span>
              </div>
            </div>

            {/* SVG arc progress */}
            <div className="flex items-center justify-center my-2">
              <svg width="100" height="60" viewBox="0 0 100 60">
                <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-surface-container-high" />
                <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="#630ed4" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${barVisible ? (precision / 100) * 125 : 0} 125`}
                  style={{ transition: 'stroke-dasharray 1.2s ease' }}
                />
                <text x="50" y="52" textAnchor="middle" className="fill-on-surface" fontSize="14" fontWeight="bold">{precision}%</text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="text-center p-2 rounded-xl bg-surface-container-high">
                <div className="font-bold text-lg text-on-surface">{totalCorrect}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">Correct</div>
              </div>
              <div className="text-center p-2 rounded-xl bg-surface-container-high">
                <div className="font-bold text-lg text-on-surface">{totalAttempts}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Module Cards Row ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          {MODULE_CARDS.map(({ to, key, icon, subKey, gradient, glow, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`group text-left rounded-3xl p-7 shadow-2xl ${glow} hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${gradient}`}
            >
              {/* BG ghost icon */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.12] transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                <span className="material-symbols-outlined text-8xl text-white">{bg}</span>
              </div>

              <div className="relative z-10 flex flex-col h-full gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">{t(subKey)}</p>
                  <h3 className="font-headline text-2xl font-bold text-white leading-tight">{t(key)}</h3>
                </div>
                <div className="flex items-center gap-1 mt-auto text-white/60 text-xs font-bold group-hover:text-white/90 transition-colors">
                  <span>Start now</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── XP & Weekly Goal ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* XP Milestone card */}
          <div className="glass-panel rounded-3xl p-7 flex items-center gap-6 hover:scale-[1.01] transition-transform duration-500">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary-container/10 border-2 border-primary/20 flex items-center justify-center shadow-inner">
                <div className="absolute inset-2 border border-dashed border-primary/30 rounded-full animate-[spin_15s_linear_infinite]" />
                <span className="material-symbols-outlined text-4xl text-primary dark:text-inverse-primary relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">{t('Milestones')}</span>
              <h3 className="font-headline text-xl font-bold mb-1">{t('Total Experience')}</h3>
              <div className="font-headline text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                {xp.toLocaleString()} <span className="text-lg text-on-surface-variant font-bold">XP</span>
              </div>
            </div>
          </div>

          {/* Weekly goal */}
          <div className="glass-panel rounded-3xl p-7 hover:scale-[1.01] transition-transform duration-500">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Weekly Goal</span>
                <h3 className="font-headline text-xl font-bold">Practice Streak</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
            </div>

            {/* 7-day dot grid */}
            <div className="flex items-center gap-2">
              {WEEK_DAYS.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full aspect-square rounded-xl transition-all duration-300 flex items-center justify-center ${
                    i < dayStreak ? 'bg-primary/20 border border-primary/30' : d.isToday ? 'bg-surface-container-high border-2 border-primary/40 border-dashed' : 'bg-surface-container-high'
                  }`}>
                    {i < dayStreak && (
                      <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                    {d.isToday && i >= dayStreak && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[9px] font-bold ${d.isToday ? 'text-primary dark:text-inverse-primary' : 'text-on-surface-variant opacity-50'}`}>{d.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-on-surface-variant font-medium">{dayStreak} / 7 days</span>
              <div className="h-1.5 flex-1 mx-4 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000" style={{ width: barVisible ? `${(Math.min(dayStreak, 7) / 7) * 100}%` : '0%' }} />
              </div>
              <span className="font-bold text-primary dark:text-inverse-primary">{Math.round((Math.min(dayStreak, 7) / 7) * 100)}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
