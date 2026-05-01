import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import LanguageModal from '../onboarding/LanguageModal';
import LandingHero from '../onboarding/LandingHero';
import { useAppContext } from '../../context/AppContext';

export default function Layout() {
  const { hasOnboarded } = useAppContext();
  // Show hero first, then language modal
  const [heroSeen, setHeroSeen] = useState(() => hasOnboarded);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {!hasOnboarded && !heroSeen && <LandingHero onGetStarted={() => setHeroSeen(true)} />}
      {!hasOnboarded && heroSeen && <LanguageModal />}
      <TopNavBar />
      {/* md:pl-56 = sidebar width (w-56 = 224px). Mobile: pt-14 for top bar, pb-20 for bottom tabs */}
      <main className="w-full relative z-0 md:pl-56 pt-14 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
