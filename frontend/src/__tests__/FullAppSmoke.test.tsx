import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, beforeEach } from 'vitest';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme';

// Import all pages
import { AboutPage } from '../pages/AboutPage';
import { AcademicProgramsPage } from '../pages/AcademicProgramsPage';
import { AdmissionsPage } from '../pages/AdmissionsPage';
import { CalendarsPage } from '../pages/CalendarsPage';
import { CampusPage } from '../pages/CampusPage';
import { EnrollmentsPage } from '../pages/EnrollmentsPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ImpactPage } from '../pages/ImpactPage';
import { LandingPage } from '../pages/LandingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PortalPage } from '../pages/PortalPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProgramDetailPage } from '../pages/ProgramDetailPage';
import { ProgramsPage } from '../pages/ProgramsPage';
import { PublicCampusPage } from '../pages/PublicCampusPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { StudentLifePage } from '../pages/StudentLifePage';
import { AcceptInvitationPage } from '../pages/AcceptInvitationPage';
import { TenantManagementPage } from '../pages/TenantManagementPage';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useInstitution
vi.mock('../hooks/useInstitution', () => ({
  useInstitution: () => ({
    name: 'Test Institution',
    fullName: 'Test Institution Full Name',
    description: 'Test Description',
    contact: { email: 'test@test.com', phone: '123', address: { street: 'Main St', city: 'City', state: 'ST', zip: '12345' } },
    socials: { facebook: '#' }
  }),
}));

const mockAuthValue = {
  user: { id: '1', email: 'test@test.com', is_active: true, memberships: [] },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
  updateProfile: vi.fn(),
  hasRole: vi.fn().mockReturnValue(true),
  logoutMessage: null,
  setLogoutMessage: vi.fn(),
};

const renderPage = (Component: React.ComponentType, initialEntries = ['/']) => {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthContext.Provider value={mockAuthValue}>
          <Routes>
            <Route path="*" element={<Component />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    </MantineProvider>
  );
};

describe('Full Application Smoke Test', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/public/aseder') || url.includes('/academic/programs')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: '1', name: 'Test Program', description: 'Test Description', program_type: 'Technical', is_active: true }],
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ([]),
      });
    }));
  });

  const pages = [
    { name: 'AboutPage', component: AboutPage },
    { name: 'AcademicProgramsPage', component: AcademicProgramsPage },
    { name: 'AdmissionsPage', component: AdmissionsPage },
    { name: 'CalendarsPage', component: CalendarsPage },
    { name: 'CampusPage', component: CampusPage },
    { name: 'EnrollmentsPage', component: EnrollmentsPage },
    { name: 'ForgotPasswordPage', component: ForgotPasswordPage },
    { name: 'ImpactPage', component: ImpactPage },
    { name: 'LandingPage', component: LandingPage },
    { name: 'NotFoundPage', component: NotFoundPage },
    { name: 'PortalPage', component: PortalPage },
    { name: 'ProfilePage', component: ProfilePage },
    { name: 'ProgramDetailPage', component: ProgramDetailPage },
    { name: 'ProgramsPage', component: ProgramsPage },
    { name: 'PublicCampusPage', component: PublicCampusPage },
    { name: 'ResetPasswordPage', component: ResetPasswordPage },
    { name: 'StudentLifePage', component: StudentLifePage },
    { name: 'AcceptInvitationPage', component: AcceptInvitationPage },
    { name: 'TenantManagementPage', component: TenantManagementPage },
  ];

  pages.forEach(({ name, component }) => {
    it(`renders ${name} without crashing`, () => {
      // Some pages might need specific initial entries or params
      let entries = ['/'];
      if (name === 'AcceptInvitationPage') entries = ['/accept?token=test'];
      if (name === 'ProgramDetailPage') entries = ['/programs/1'];
      if (name === 'ResetPasswordPage') entries = ['/reset?token=test'];
      if (name === 'TenantManagementPage') entries = ['/portal/manage/t1'];
      if (name === 'AcademicProgramsPage') entries = ['/portal/academic/programs'];
      if (name === 'CalendarsPage') entries = ['/portal/calendar/academic-periods'];
      
      renderPage(component, entries);
    });
  });
});
