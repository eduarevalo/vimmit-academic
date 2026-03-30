import { render, screen } from '@testing-library/react';
import { MainLayout } from '../MainLayout';
import { PortalLayout } from '../PortalLayout';
import { AuthLayout } from '../AuthLayout';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
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
  hasRole: vi.fn(),
  logoutMessage: null,
  setLogoutMessage: vi.fn(),
};

const renderWithProviders = (Component: React.FC) => {
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

describe('Layout Components', () => {
  it('renders MainLayout with children', () => {
    renderWithProviders(MainLayout);
    // MainLayout has Header and Footer
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });

  it('renders PortalLayout with children', () => {
    renderWithProviders(PortalLayout);
    // PortalLayout has PortalHeader and PortalNav
    expect(screen.getByRole('banner')).toBeDefined();
  });

  it('renders AuthLayout with children', () => {
    renderWithProviders(AuthLayout);
    // AuthLayout has a centered container
    expect(screen.getByRole('main')).toBeDefined();
  });
});
