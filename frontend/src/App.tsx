import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RegistrationModal } from './components/RegistrationModal';
import { MainLayout } from './layouts/MainLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { LoadingOverlay } from '@mantine/core';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const PublicProgramsPage = lazy(() => import('./pages/PublicProgramsPage').then(module => ({ default: module.PublicProgramsPage })));
const AdmissionsPage = lazy(() => import('./pages/AdmissionsPage').then(module => ({ default: module.AdmissionsPage })));
const StudentLifePage = lazy(() => import('./pages/StudentLifePage').then(module => ({ default: module.StudentLifePage })));
const PortalPage = lazy(() => import('./pages/PortalPage').then(module => ({ default: module.PortalPage })));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage').then(module => ({ default: module.ProgramsPage })));
const CampusPage = lazy(() => import('./pages/CampusPage').then(module => ({ default: module.CampusPage })));
const CalendarsPage = lazy(() => import('./pages/CalendarsPage').then(module => ({ default: module.CalendarsPage })));
const EnrollmentsPage = lazy(() => import('./pages/EnrollmentsPage').then(module => ({ default: module.EnrollmentsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingOverlay visible zIndex={1000} overlayProps={{ blur: 2 }} />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/programs" element={<PublicProgramsPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/student-life" element={<StudentLifePage />} />
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
        </Suspense>

        {/* Global UI Elements */}
        <RegistrationModal />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
