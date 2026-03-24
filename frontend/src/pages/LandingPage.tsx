import { Hero } from '../components/Hero';
import { ProgramsSection } from '../components/ProgramsSection';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
      <Hero onExplore={() => navigate('/info')} />
      <ProgramsSection />
    </>
  );
}
