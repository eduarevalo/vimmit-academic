import { render, screen } from '@testing-library/react';
import { PortalNav } from '../portal/PortalNav';
import { PortalFooter } from '../portal/PortalFooter';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../theme';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockAuthValue = {
  user: { id: '1', email: 'test@test.com', first_name: 'John', last_name: 'Doe', memberships: [] },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
  updateProfile: vi.fn(),
  hasRole: vi.fn().mockImplementation((roles) => roles.includes('Admin')),
  logoutMessage: null,
  setLogoutMessage: vi.fn(),
};

const renderWithProviders = (Component: React.ComponentType) => {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue as any}>
          <Component />
        </AuthContext.Provider>
      </MemoryRouter>
    </MantineProvider>
  );
};

describe('Portal Internal Components', () => {
  it('renders PortalNav with links', () => {
    renderWithProviders(() => <PortalNav mobileOpened={false} onMobileClose={vi.fn()} />);
    // PortalNav contains links like 'portal.nav.programs'
    expect(screen.getByText(/portal\.nav\.programs/i)).toBeDefined();
    expect(screen.getByText(/portal\.nav\.courses/i)).toBeDefined();
  });

  it('renders PortalFooter', () => {
    renderWithProviders(PortalFooter);
    // portal.footer.rights is the translation key
    expect(screen.getByText(/2026/i)).toBeDefined();
    expect(screen.getByText(/portal\.footer\.rights/i)).toBeDefined();
  });
});
