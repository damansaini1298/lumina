import React from 'react';

interface Props {
  onGetStarted: () => void;
}

const FEATURES = [
  { icon: 'mic', label: 'Native Audio', desc: 'Real pronunciation, not a robot', color: 'from-violet-500 to-purple-600' },
  { icon: 'psychology', label: 'Spaced Repetition', desc: 'SM-2 algorithm learns with you', color: 'from-blue-500 to-cyan-500' },
  { icon: 'calculate', label: 'Math Sprint', desc: 'Sharpen mental arithmetic daily', color: 'from-orange-400 to-amber-500' },
  { icon: 'translate', label: '10 Languages', desc: 'Spanish · French · Japanese · more', color: 'from-emerald-500 to-teal-500' },
];

const WORD_PILLS = [
  { word: 'こんにちは', lang: 'ja', meaning: 'Hello' },
  { word: 'Bonjour', lang: 'fr', meaning: 'Hello' },
  { word: 'привет', lang: 'ru', meaning: 'Hi' },
  { word: '你好', lang: 'zh', meaning: 'Hello' },
  { word: 'Hola', lang: 'es', meaning: 'Hello' },
  { word: 'Ciao', lang: 'it', meaning: 'Hi' },
];

export default function LandingHero({ onGetStarted }: Props) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0d0d1a] dark:bg-[#0d0d1a] light:bg-gradient-to-br light:from-[#f0eeff] light:to-white">

      {/* Animated mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="ambient-orb absolute w-[70%] h-[70%] opacity-[0.18]"
          style={{
            background: 'radial-gradient(circle, #630ed4, transparent 70%)',
            top: '-20%', left: '-20%',
            '--dur': '18s', '--tx': '60px', '--ty': '-40px'
          } as React.CSSProperties}
        />
        <div
          className="ambient-orb absolute w-[50%] h-[50%] opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, #7c3aed, transparent 70%)',
            bottom: '-20%', right: '-10%',
            '--dur': '14s', '--tx': '-40px', '--ty': '30px'
          } as React.CSSProperties}
        />
        <div
          className="ambient-orb absolute w-[30%] h-[30%] opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, #10b981, transparent 70%)',
            top: '40%', right: '20%',
            '--dur': '22s', '--tx': '20px', '--ty': '-50px'
          } as React.CSSProperties}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Floating word pills */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {WORD_PILLS.map((pill, i) => (
          <div
            key={pill.word}
            className="absolute animate-bounce"
            style={{
              top: `${10 + (i * 14) % 80}%`,
              left: i % 2 === 0 ? `${3 + (i * 7) % 12}%` : `${80 + (i * 3) % 15}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
              <span className="text-sm font-bold text-white/80">{pill.word}</span>
              <span className="text-[10px] text-white/40 font-medium">{pill.meaning}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-full flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95 duration-700">

          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#630ed4] to-[#7c3aed] shadow-2xl shadow-purple-900/50 mb-10 relative">
            <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm" />
            <span
              className="material-symbols-outlined text-white text-5xl relative z-10"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              language
            </span>
          </div>

          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Lumina · Language Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-headline font-black tracking-tight leading-none mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}>
            <span className="text-white">Learn Languages</span>
            <br />
            <span className="bg-gradient-to-r from-[#a855f7] via-[#7c3aed] to-[#6366f1] bg-clip-text text-transparent">
              The Smart Way
            </span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-md mx-auto mb-14 leading-relaxed font-medium">
            A distraction-free platform for daily language practice, powered by spaced‑repetition science and native audio.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
            {FEATURES.map(f => (
              <div
                key={f.label}
                className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 text-left flex flex-col gap-3 overflow-hidden group hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                  <span
                    className="material-symbols-outlined text-white text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {f.icon}
                  </span>
                </div>
                <div>
                  <p className="font-label text-[11px] font-bold text-white/80 leading-tight">{f.label}</p>
                  <p className="font-body text-[10px] text-white/40 leading-snug mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-full font-label font-bold text-lg text-white transition-all duration-300 hover:scale-105 active:scale-[0.98] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #630ed4, #7c3aed, #6366f1)' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Get Started</span>
              <span
                className="material-symbols-outlined text-xl relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                arrow_forward
              </span>
            </button>

            <p className="font-label text-xs text-white/25 tracking-wide">
              No account required · Works offline · 3,000 words per language
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
