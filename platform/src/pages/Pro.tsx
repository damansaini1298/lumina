export default function Pro() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-8 lg:p-16 flex flex-col items-center animate-in fade-in duration-700 z-10">
      
      {/* Ambient Particle Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb absolute w-[50%] h-[50%] bg-primary opacity-[0.15]"
          style={{ top: '-15%', left: '20%', '--dur': '20s', '--tx': '-40px', '--ty': '50px' } as React.CSSProperties} />
        <div className="ambient-orb absolute w-[35%] h-[35%] bg-tertiary opacity-[0.1]"
          style={{ top: '60%', right: '-10%', '--dur': '15s', '--tx': '30px', '--ty': '-30px' } as React.CSSProperties} />
      </div>

      {/* Editorial Statement Header */}
      <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        <span className="text-primary dark:text-inverse-primary text-[11px] font-label font-bold uppercase tracking-[0.2em] mb-8 block px-6 py-2 glass-panel w-fit mx-auto rounded-full border border-primary/20">The Digital Atelier</span>
        <h1 className="font-headline text-6xl lg:text-7xl font-bold tracking-tight text-on-surface leading-tight mb-8">
          Architect Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container drop-shadow-sm">Fluency</span>
        </h1>
        <p className="font-body text-xl text-on-surface-variant tracking-wide font-medium">
          Step into a bespoke study environment. Lumina Pro removes the mental friction from your learning workflow with unrestricted access to auditory dictations and infinite algorithmic challenges.
        </p>
      </div>

      {/* Floating Cards (Intentional Asymmetry) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-6xl mx-auto relative z-10">
        
        {/* Large Feature Card */}
        <div className="md:col-span-8 glass-panel-heavy rounded-[3rem] p-12 relative overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-secondary/20 blur-[100px] rounded-full"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center mb-8 shadow-inner border border-secondary/20">
            <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
          </div>
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">Infinite Dictation Mode</h2>
          <p className="font-body text-lg text-on-surface-variant font-medium leading-relaxed max-w-xl">
            Bypass your mental filter. Access thousands of native-speaker audio snippets across 6 languages to build direct word-to-sound neural pathways.
          </p>
        </div>

        {/* Tall Feature Card */}
        <div className="md:col-span-4 glass-panel rounded-[3rem] p-12 relative overflow-hidden flex flex-col justify-between mt-0 md:mt-16 transition-transform duration-500 hover:scale-[1.02]">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-8 shadow-inner border border-primary/20">
               <span className="material-symbols-outlined text-4xl text-primary dark:text-inverse-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-4">Algorithmic Math</h2>
            <p className="font-body text-on-surface-variant font-medium leading-relaxed">Endless procedural arithmetic to sharpen your cognitive baseline.</p>
          </div>
        </div>

        {/* Wide Feature Card */}
        <div className="md:col-span-12 glass-panel-heavy rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 mt-0 md:-mt-8 relative z-20">
          <div>
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-3">Ready to elevate your study?</h2>
            <p className="font-body text-lg text-on-surface-variant font-medium">Join the global atelier and unlock premium algorithms.</p>
          </div>
          <button className="bg-gradient-to-br from-primary to-primary-container text-white px-14 py-6 rounded-full font-label font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_12px_24px_rgba(99,14,212,0.3)] border border-white/20 whitespace-nowrap">
            Upgrade to Pro
          </button>
        </div>

      </div>

    </div>
  );
}
