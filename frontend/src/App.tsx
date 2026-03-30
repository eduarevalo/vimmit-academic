import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RegistrationModal } from './components/RegistrationModal';
import { MainLayout } from './layouts/MainLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LoadingOverlay } from '@mantine/core';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage').then(module => ({ default: module.ProgramsPage })));
const AdmissionsPage = lazy(() => import('./pages/AdmissionsPage').then(module => ({ default: module.AdmissionsPage })));
const StudentLifePage = lazy(() => import('./pages/StudentLifePage').then(module => ({ default: module.StudentLifePage })));
const PortalPage = lazy(() => import('./pages/PortalPage').then(module => ({ default: module.PortalPage })));
const AcademicProgramsPage = lazy(() => import('./pages/AcademicProgramsPage').then(module => ({ default: module.AcademicProgramsPage })));
const CampusPage = lazy(() => import('./pages/CampusPage').then(module => ({ default: module.CampusPage })));
const CalendarsPage = lazy(() => import('./pages/CalendarsPage').then(module => ({ default: module.CalendarsPage })));
const EnrollmentsPage = lazy(() => import('./pages/EnrollmentsPage').then(module => ({ default: module.EnrollmentsPage })));
const ImpactPage = lazy(() => import('./pages/ImpactPage').then(module => ({ default: module.ImpactPage })));
const ProgramDetailPage = lazy(() => import('./pages/ProgramDetailPage').then(module => ({ default: module.ProgramDetailPage })));
const PublicCampusPage = lazy(() => import('./pages/PublicCampusPage').then(module => ({ default: module.PublicCampusPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const TenantManagementPage = lazy(() => import('./pages/TenantManagementPage').then(module => ({ default: module.TenantManagementPage })));
const AcceptInvitationPage = lazy(() => import('./pages/AcceptInvitationPage').then(module => ({ default: module.AcceptInvitationPage })));
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
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/programs/:programId" element={<ProgramDetailPage />} />
              <Route path="/campus" element={<PublicCampusPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/student-life" element={<StudentLifePage />} />
              <Route path="/impact" element={<ImpactPage />} />
            </Route>
            
            {/* Distraction-free Portal Flows */}
            <Route path="/portal" element={<AuthLayout />}>
              <Route path="accept-invitation" element={<AcceptInvitationPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Portal Application Routes */}
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalPage />} />
              
              {/* Academic */}
              <Route path="academic/programs" element={<AcademicProgramsPage />} />
              
              {/* Administrative */}
              <Route path="administrative/enrollments" element={<EnrollmentsPage />} />
              
              {/* Organization */}
              <Route path="organization/campus" element={<CampusPage />} />
              
              {/* Calendar */}
              <Route path="calendar/academic-periods" element={<CalendarsPage />} />

              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />

              {/* Tenant Management */}
              <Route path="manage/:tenantId" element={<TenantManagementPage />} />

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
