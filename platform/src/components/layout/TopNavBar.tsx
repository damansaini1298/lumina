import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../onboarding/LanguageModal';
import { useState, useEffect } from 'react';
import { useTranslate } from '../../utils/i18n';

const NAV_LINKS = [
  { to: '/',          icon: 'home',      key: 'Home'      },
  { to: '/dictation', icon: 'mic',       key: 'Dictation' },
  { to: '/math',      icon: 'calculate', key: 'Math'      },
  { to: '/language',  icon: 'style',     key: 'Vault'     },
];

export default function TopNavBar() {
  const { learningLang, setHasOnboarded, uiMode, setUiMode, activeLang, streak, coins } = useAppContext();
  const t = useTranslate(activeLang);
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const willBeDark = document.documentElement.classList.toggle('dark');
    setIsDark(willBeDark);
    localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
  };

  const learningNative = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.native ?? '—';
  const learningName   = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.name ?? 'English';
  const learningFlag   = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.ccode ?? 'us';

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* ══════════════ DESKTOP SIDEBAR ══════════════ */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col z-50 border-r border-outline-variant/20 dark:border-white/5 bg-surface-container-lowest dark:bg-surface-container">

        {/* Brand */}
        <div className="px-6 pt-7 pb-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#630ed4] to-[#7c3aed] flex items-center justify-center shadow-md flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-on-surface group-hover:text-primary dark:group-hover:text-inverse-primary transition-colors">Lumina</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, icon, key }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  active
                    ? 'bg-primary/10 dark:bg-inverse-primary/10 text-primary dark:text-inverse-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px] flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="font-semibold text-[14px]">{t(key)}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary dark:bg-inverse-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language selector */}
        <div className="px-4 py-3 border-t border-outline-variant/20 dark:border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 px-1">{t('Learning Language')}</p>
          <button
            onClick={() => setHasOnboarded(false)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-all group"
          >
            <img src={`https://flagcdn.com/w40/${learningFlag}.png`} alt={learningName} className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0" />
            <div className="text-left min-w-0">
              <p className="font-bold text-sm text-on-surface truncate">{learningNative}</p>
              <p className="text-[10px] text-on-surface-variant">{learningName}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform">chevron_right</span>
          </button>
        </div>

        {/* Stats */}
        <div className="px-5 py-3 border-t border-outline-variant/20 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="text-sm font-bold text-on-surface">{streak}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-on-surface">{coins}</span>
            <span className="material-symbols-outlined text-amber-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="px-4 py-4 border-t border-outline-variant/20 dark:border-white/5 flex flex-col gap-2">
          {/* UI Language mode */}
          <div className="flex rounded-xl border border-outline-variant/30 dark:border-white/10 overflow-hidden">
            {(['en', 'native', 'target'] as const).map((mode, i) => (
              <button
                key={mode}
                onClick={() => setUiMode(mode)}
                title={mode === 'en' ? t('English') : mode === 'native' ? t('Native') : t('Target')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-tight transition-all ${
                  i > 0 ? 'border-l border-outline-variant/30 dark:border-white/10' : ''
                } ${uiMode === mode ? 'bg-primary dark:bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {mode === 'en' ? 'EN' : mode === 'native' ? 'Nat' : 'Trg'}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-outline-variant/30 dark:border-white/10 hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
            <span className="text-xs font-medium">{isDark ? t('Switch to Light Mode') : t('Switch to Dark Mode')}</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MOBILE TOP BAR ══════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-surface-container-lowest/80 dark:bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20 dark:border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#630ed4] to-[#7c3aed] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
          </div>
          <span className="font-serif font-bold text-lg tracking-tight text-on-surface">Lumina</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="text-sm font-bold text-on-surface">{streak}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-on-surface">{coins}</span>
            <span className="material-symbols-outlined text-amber-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-outline-variant/40 dark:border-white/10 text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        </div>
      </header>

      {/* ══════════════ MOBILE BOTTOM TABS ══════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center bg-surface-container-lowest/90 dark:bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/20 dark:border-white/5 rounded-t-2xl">
        {NAV_LINKS.map(({ to, icon, key }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all active:scale-95 relative">
              {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary dark:bg-inverse-primary rounded-full" />}
              <span
                className={`material-symbols-outlined text-[22px] transition-all ${active ? 'text-primary dark:text-inverse-primary' : 'text-on-surface-variant'}`}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className={`text-[10px] font-bold transition-all ${active ? 'text-primary dark:text-inverse-primary' : 'text-on-surface-variant'}`}>
                {t(key)}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ══════════════ MOBILE SETTINGS DRAWER ══════════════ */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
      )}
      <aside className={`md:hidden fixed top-0 right-0 h-full z-[70] w-72 flex flex-col transition-transform duration-300 ease-out bg-surface-container-lowest dark:bg-surface-container border-l border-outline-variant/30 dark:border-white/10 shadow-2xl ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20 dark:border-white/10">
          <span className="font-serif font-bold text-xl text-on-surface">{t('Settings')}</span>
          <button onClick={() => setDrawerOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center border border-outline-variant/30 dark:border-white/10 text-on-surface-variant hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">{t('Learning Language')}</p>
            <button onClick={() => { setHasOnboarded(false); setDrawerOpen(false); }} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-outline-variant/30 dark:border-white/10 hover:bg-surface-container-high transition-all">
              <img src={`https://flagcdn.com/w40/${learningFlag}.png`} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm" />
              <div className="text-left">
                <p className="font-bold text-sm text-on-surface">{learningNative}</p>
                <p className="text-xs text-on-surface-variant">{t('Tap to change language')}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant ml-auto text-[18px]">chevron_right</span>
            </button>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">{t('Interface Language')}</p>
            <div className="flex rounded-2xl border border-outline-variant/30 dark:border-white/10 overflow-hidden">
              {(['en', 'native', 'target'] as const).map((mode, i) => (
                <button key={mode} onClick={() => setUiMode(mode)}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${i > 0 ? 'border-l border-outline-variant/30 dark:border-white/10' : ''} ${uiMode === mode ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {mode === 'en' ? t('English') : mode === 'native' ? t('Native') : t('Target')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">{t('Appearance')}</p>
            <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-outline-variant/30 dark:border-white/10 hover:bg-surface-container-high transition-all">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </div>
              <span className="font-medium text-sm text-on-surface">{isDark ? t('Switch to Light Mode') : t('Switch to Dark Mode')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
