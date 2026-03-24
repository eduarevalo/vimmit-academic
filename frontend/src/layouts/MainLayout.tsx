import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function MainLayout() {
  const navigate = useNavigate();

  return (
    <>
      <Header 
        onStartJourney={() => navigate('/info')} 
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
