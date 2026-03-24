import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProgramsSection } from './components/ProgramsSection';
import { Footer } from './components/Footer';
import { InformationPage } from './components/InformationPage';
import { RegistrationModal } from './components/RegistrationModal';
import { useState } from 'react';

function App() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <Header onStartJourney={() => setShowInfo(true)} />
      {!showInfo ? (
        <>
          <Hero onExplore={() => setShowInfo(true)} />
          <ProgramsSection />
        </>
      ) : (
        <InformationPage />
      )}
      <Footer />
      <RegistrationModal />
    </>
  );
}

export default App;
