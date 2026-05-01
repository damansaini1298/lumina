import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  interfaceLang: string;
  setInterfaceLang: (lang: string) => void;
  learningLang: string;
  setLearningLang: (lang: string) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;
  uiMode: 'native' | 'en' | 'target';
  setUiMode: (val: 'native' | 'en' | 'target') => void;
  activeLang: string;
  // ── Live stats ──
  streak: number;      // consecutive correct answers (session hot streak)
  dayStreak: number;   // calendar day streak (increments once per day)
  addStreak: () => void;
  coins: number;
  addCoins: (amount: number) => void;
  totalCorrect: number;
  totalAttempts: number;
  // ── Tutorials ──
  tutorials: Record<string, boolean>;
  markTutorialSeen: (page: string) => void;
  recordAttempt: (correct: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme]         = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [interfaceLang, setInterfaceLang] = useState<string>(() => localStorage.getItem('interfaceLang') || 'en-US');
  const [learningLang,  setLearningLang]  = useState<string>(() => localStorage.getItem('learningLang')  || '');
  const [hasOnboarded, setHasOnboarded]   = useState<boolean>(() => localStorage.getItem('hasOnboarded') === 'true');
  const [uiMode, setUiMode] = useState<'native' | 'en' | 'target'>(() => (localStorage.getItem('uiMode') as 'native' | 'en' | 'target') || 'en');

  // ── Stats ──
  const [streak,        setStreak]        = useState<number>(0); // session hot streak, not persisted
  const [coins,         setCoins]         = useState<number>(() => Number(localStorage.getItem('coins'))         || 0);
  const [totalCorrect,  setTotalCorrect]  = useState<number>(() => Number(localStorage.getItem('totalCorrect'))  || 0);
  const [totalAttempts, setTotalAttempts] = useState<number>(() => Number(localStorage.getItem('totalAttempts')) || 0);

  // ── Day streak (real calendar-based) ──
  const [dayStreak, setDayStreak] = useState<number>(() => {
    const saved = Number(localStorage.getItem('dayStreak')) || 0;
    const lastDate = localStorage.getItem('lastActiveDate') || '';
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today) return saved;          // already active today
    if (lastDate === yesterday) return saved;      // active yesterday — streak intact
    if (lastDate === '') return 0;                 // fresh start
    return 0;                                      // missed a day — reset
  });

  const [tutorials, setTutorials] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('tutorials') || '{}'); } catch { return {}; }
  });

  const activeLang = uiMode === 'native' ? interfaceLang : uiMode === 'target' ? learningLang : 'en-US';

  const markTutorialSeen = (page: string) => {
    setTutorials(prev => {
      const next = { ...prev, [page]: true };
      localStorage.setItem('tutorials', JSON.stringify(next));
      return next;
    });
  };

  const addStreak  = () => setStreak(s => s + 1);
  const addCoins   = (amount: number) => setCoins(c => c + amount);
  const recordAttempt = (correct: boolean) => {
    setTotalAttempts(a => a + 1);
    if (correct) {
      setTotalCorrect(c => c + 1);
      setCoins(c => c + 10);        // +10 coins per correct answer
      setStreak(s => s + 1);        // hot streak = consecutive correct answers

      // ── Calendar day streak ──────────────────────────────────────
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem('lastActiveDate') || '';
      if (lastDate !== today) {
        // First correct answer of the day
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        setDayStreak(prev => {
          const next = lastDate === yesterday ? prev + 1 : 1;
          localStorage.setItem('dayStreak', String(next));
          return next;
        });
        localStorage.setItem('lastActiveDate', today);
      }
      // ─────────────────────────────────────────────────────────────
    } else {
      setStreak(0);                  // reset hot streak on wrong answer
    }
  };

  // ── Theme sync ──
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // ── Persist all ──
  useEffect(() => {
    localStorage.setItem('theme',         theme);
    localStorage.setItem('interfaceLang', interfaceLang);
    localStorage.setItem('learningLang',  learningLang);
    localStorage.setItem('hasOnboarded',  String(hasOnboarded));
    localStorage.setItem('uiMode',        uiMode);
    localStorage.setItem('coins',         String(coins));
    localStorage.setItem('totalCorrect',  String(totalCorrect));
    localStorage.setItem('totalAttempts', String(totalAttempts));
    // dayStreak and lastActiveDate are written directly in recordAttempt
  }, [theme, interfaceLang, learningLang, hasOnboarded, uiMode, coins, totalCorrect, totalAttempts]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      interfaceLang, setInterfaceLang,
      learningLang, setLearningLang,
      hasOnboarded, setHasOnboarded,
      uiMode, setUiMode,
      activeLang,
      streak, dayStreak, addStreak,
      coins, addCoins,
      totalCorrect, totalAttempts, recordAttempt,
      tutorials, markTutorialSeen,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
