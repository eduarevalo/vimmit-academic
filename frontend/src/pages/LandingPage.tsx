import { Hero } from '../components/Hero';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
      <Hero onExplore={() => navigate('/programs')} onLearnMore={() => navigate('/impact')} />
    </>
  );
}
