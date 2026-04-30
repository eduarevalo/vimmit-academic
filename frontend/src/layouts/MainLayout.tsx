import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useRegistrationModal } from '../hooks/useRegistrationModal';

export function MainLayout() {
  const navigate = useNavigate();
  const { open: openRegistration } = useRegistrationModal();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        onStartJourney={openRegistration} 
        showLogin={false} 
        onLogoClick={() => navigate('/')}
        showUser={false}
      />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
