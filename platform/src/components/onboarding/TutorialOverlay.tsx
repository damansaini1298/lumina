import { useAppContext } from '../../context/AppContext';

interface TutorialOverlayProps {
  pageId: string;
  title: string;
  description: string;
  icon: string;
}

export default function TutorialOverlay({ pageId, title, description, icon }: TutorialOverlayProps) {
  const { tutorials, markTutorialSeen } = useAppContext();

  if (tutorials[pageId]) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 delay-100 border border-outline-variant/30 dark:border-white/10">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl bg-gradient-to-br from-primary to-primary-container text-white">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <h2 className="text-2xl font-black text-on-surface tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-[14px] text-on-surface-variant leading-relaxed mb-8 font-medium">
          {description}
        </p>
        <button
          onClick={() => markTutorialSeen(pageId)}
          className="w-full py-4 rounded-2xl font-bold text-[15px] uppercase tracking-widest cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 text-white bg-gradient-to-r from-primary to-primary-container"
        >
          Got it, let's go!
        </button>
      </div>
    </div>
  );
}
