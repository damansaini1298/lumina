import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', ccode: 'cn', name: 'Chinese',    native: '中文'      },
  { code: 'en-US', ccode: 'us', name: 'English',    native: 'English'  },
  { code: 'fr-FR', ccode: 'fr', name: 'French',     native: 'Français' },
  { code: 'de-DE', ccode: 'de', name: 'German',     native: 'Deutsch'  },
  { code: 'hi-IN', ccode: 'in', name: 'Hindi',      native: 'हिन्दी'     },
  { code: 'it-IT', ccode: 'it', name: 'Italian',    native: 'Italiano' },
  { code: 'ja-JP', ccode: 'jp', name: 'Japanese',   native: '日本語'    },
  { code: 'pt-BR', ccode: 'br', name: 'Portuguese', native: 'Português'},
  { code: 'ru-RU', ccode: 'ru', name: 'Russian',    native: 'Русский'  },
  { code: 'es-ES', ccode: 'es', name: 'Spanish',    native: 'Español'  },
];

export default function LanguageModal() {
  const { interfaceLang, setInterfaceLang, learningLang, setLearningLang, setHasOnboarded, setUiMode } = useAppContext();
  const [step, setStep] = useState<'interface' | 'learning'>('interface');
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (code: string) => {
    setSelected(code);
    setTimeout(() => {
      if (step === 'interface') { 
        setInterfaceLang(code); 
        setUiMode('native');
        setStep('learning'); 
        setSelected(null); 
      }
      else { setLearningLang(code); setHasOnboarded(true); }
    }, 220);
  };

  const isInterface = step === 'interface';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-3xl transition-all duration-500">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_32px_120px_rgba(0,0,0,0.15)] flex flex-col md:flex-row border border-outline-variant/30 animate-in zoom-in-95 duration-500">

        {/* ── Left Information Panel ── */}
        <div className="relative p-10 md:w-2/5 flex flex-col justify-between bg-gradient-to-br from-[#630ed4] to-[#7c3aed] text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[64px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-8 backdrop-blur-md shadow-inner">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                language
              </span>
            </div>
            <h2 className="font-headline font-bold text-3xl md:text-4xl mb-4 leading-tight tracking-tight">
              {isInterface ? 'Tailor Your Experience' : 'Your Learning Journey'}
            </h2>
            <p className="font-body text-white/80 text-sm md:text-base leading-relaxed">
              {isInterface
                ? 'Selecting your linguistic foundation allows us to curate content that resonates with you.'
                : 'Choose the language you want to master. We will adapt the curriculum slightly to maximize your current proficiency.'}
            </p>
          </div>

          {/* Steps tracker */}
          <div className="mt-12 flex gap-3">
             <div className={`h-1.5 flex-1 rounded-full ${isInterface ? 'bg-white' : 'bg-white/30'}`}></div>
             <div className={`h-1.5 flex-1 rounded-full ${!isInterface ? 'bg-white' : 'bg-white/30'}`}></div>
          </div>
        </div>

        {/* ── Language Grid ── */}
        <div className="p-8 md:p-10 md:w-3/5 bg-transparent max-h-[60vh] overflow-y-auto">
          <h3 className="font-label text-xs uppercase tracking-widest text-primary dark:text-inverse-primary font-bold mb-6">
            {isInterface ? 'Your Native Language' : 'I Want To Study'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isChosen = isInterface ? interfaceLang === lang.code : learningLang === lang.code;
              const isSelecting = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 text-left border ${
                    isSelecting 
                      ? 'bg-primary dark:bg-inverse-primary text-white dark:text-[#25005a] border-primary dark:border-inverse-primary shadow-lg scale-95' 
                      : isChosen
                        ? 'bg-primary/5 dark:bg-inverse-primary/10 border-primary/30 dark:border-inverse-primary/30 scale-100'
                        : 'bg-surface-container border-outline-variant/30 hover:bg-surface-container-high hover:border-outline-variant/60 scale-100 hover:shadow-md'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={`https://flagcdn.com/w40/${lang.ccode}.png`} alt={lang.name}
                      className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-surface-container" />
                    {isChosen && !isSelecting && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-[#10b981] shadow-sm">
                        <span className="material-symbols-outlined text-white text-[12px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`font-body font-bold text-sm leading-tight transition-colors ${
                       isSelecting ? 'text-white dark:text-[#25005a]' : 'text-on-surface'
                    }`}>{lang.native}</p>
                    <p className={`font-label text-[11px] mt-0.5 uppercase tracking-wide transition-colors ${
                       isSelecting ? 'text-white/70 dark:text-[#25005a]/70' : 'text-on-surface-variant'
                    }`}>{lang.name}</p>
                  </div>
                  
                  {isSelecting && (
                      <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse pointer-events-none"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
