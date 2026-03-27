import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useRegistrationModal } from '../hooks/useRegistrationModal';

export function MainLayout() {
  const navigate = useNavigate();
  const { open: openRegistration } = useRegistrationModal();

  return (
    <>
      <Header 
        onStartJourney={openRegistration} 
        showLogin={false} 
        onLogoClick={() => navigate('/')}
        showUser={false}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
