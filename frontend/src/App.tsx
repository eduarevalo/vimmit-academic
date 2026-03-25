import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RegistrationModal } from './components/RegistrationModal';
import { LoginModal } from './components/LoginModal';
import { MainLayout } from './layouts/MainLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { LandingPage } from './pages/LandingPage';
import { InfoPage } from './pages/InfoPage';
import { PortalPage } from './pages/PortalPage';
import { ProgramsPage } from './pages/ProgramsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/info" element={<InfoPage />} />
          </Route>

          {/* Portal Routes */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalPage />} />
            <Route path="programs" element={<ProgramsPage />} />
          </Route>
        </Routes>
        
        {/* Global UI Elements */}
        <RegistrationModal />
        <LoginModal />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
