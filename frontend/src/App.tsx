import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RegistrationModal } from './components/RegistrationModal';
import { MainLayout } from './layouts/MainLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { LandingPage } from './pages/LandingPage';
import { InfoPage } from './pages/InfoPage';
import { PortalPage } from './pages/PortalPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { CampusPage } from './pages/CampusPage';
import { CalendarsPage } from './pages/CalendarsPage';
import { EnrollmentsPage } from './pages/EnrollmentsPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
            
            {/* Academic */}
            <Route path="academic/programs" element={<ProgramsPage />} />
            
            {/* Administrative */}
            <Route path="administrative/enrollments" element={<EnrollmentsPage />} />
            
            {/* Organization */}
            <Route path="organization/campus" element={<CampusPage />} />
            
            {/* Calendar */}
            <Route path="calendar/academic-periods" element={<CalendarsPage />} />

            {/* Portal Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Public Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global UI Elements */}
        <RegistrationModal />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
