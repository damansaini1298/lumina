import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../onboarding/LanguageModal';

const NAV = [
  { to: '/',          icon: 'home',          label: 'Home'      },
  { to: '/language',  icon: 'style',         label: 'Flashcards'},
  { to: '/dictation', icon: 'mic',           label: 'Dictation' },
  { to: '/math',      icon: 'calculate',     label: 'Math'      },
];

export default function SideNavBar() {
  const loc = useLocation();
  const { learningLang, totalCorrect, totalAttempts } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const learningFlag = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.ccode ?? 'us';
  const learningName = SUPPORTED_LANGUAGES.find(l => l.code === learningLang)?.name ?? 'English';
  const precision    = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

  const NavContent = () => (
    <>
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(147 51 234) 100%)' }}>
            <span className="material-symbols-outlined text-white text-[17px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
          </div>
          <span className="font-bold text-[17px] tracking-[-0.02em]"
            style={{ color: 'rgb(var(--ink))' }}>Lumina</span>
        </div>
        <button className="md:hidden cursor-pointer" onClick={() => setMobileOpen(false)}>
          <span className="material-symbols-outlined text-[20px]"
            style={{ color: 'rgb(var(--ink-3))' }}>close</span>
        </button>
      </div>

      {/* ── Language badge ── */}
      <div className="mx-4 mb-4 p-3 rounded-14px"
        style={{ background: 'rgba(var(--primary-surface, var(--bg-3)), 1)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: 'rgb(var(--ink-3))' }}>Currently Learning</p>
        <div className="flex items-center gap-2.5">
          <img src={`https://flagcdn.com/w40/${learningFlag}.png`} alt={learningName}
            className="w-6 h-6 rounded-full object-cover border"
            style={{ borderColor: 'rgb(var(--border))' }} />
          <span className="font-semibold text-[13px]"
            style={{ color: 'rgb(var(--ink))' }}>{learningName}</span>
        </div>
        {/* XP bar */}
        <div className="mt-2.5">
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'rgb(var(--ink-3))' }}>Precision</span>
            <span className="text-[10px] font-semibold" style={{ color: 'rgb(var(--primary))' }}>
              {precision}%
            </span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${precision}%` }} />
          </div>
        </div>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-3">
        {NAV.map(({ to, icon, label }) => {
          const isActive = to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer transition-all duration-150"
              style={{
                background: isActive ? 'rgba(var(--primary), 0.1)' : 'transparent',
                textDecoration: 'none',
              }}>
              <span className="material-symbols-outlined text-[20px] flex-shrink-0"
                style={{
                  color: isActive ? 'rgb(var(--primary))' : 'rgb(var(--ink-3))',
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}>{icon}</span>
              <span className="text-[13px] font-semibold"
                style={{ color: isActive ? 'rgb(var(--primary))' : 'rgb(var(--ink-2))' }}>
                {label}
              </span>
              {label === 'Pro' && (
                <span className="ml-auto pill text-[9px]"
                  style={{ background: 'rgba(var(--amber), 0.15)', color: 'rgb(var(--amber))' }}>
                  ✦ Unlock
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button className="md:hidden fixed top-3.5 left-4 z-[70] cursor-pointer"
        onClick={() => setMobileOpen(true)}
        style={{ color: 'rgb(var(--ink))' }}>
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[65]"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className="md:hidden fixed left-0 top-0 h-full z-[66] flex flex-col transition-transform duration-300"
        style={{
          width: '260px',
          background: 'rgb(var(--bg))',
          borderRight: '1px solid rgb(var(--border))',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-[60] flex-col"
        style={{
          width: '240px',
          background: 'rgb(var(--bg))',
          borderRight: '1px solid rgb(var(--border))',
        }}>
        <NavContent />
      </aside>
    </>
  );
}
