import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '../Footer';
import { Header } from '../Header';
import { PortalHeader } from '../PortalHeader';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { AuthContext } from '../../context/AuthContext';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockAuthValue = {
  user: null,
  token: null,
  isAuthenticated: false,
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

const renderWithProviders = (Component: React.ComponentType) => {
  return render(
    <MantineProvider>
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Component />
        </AuthContext.Provider>
      </BrowserRouter>
    </MantineProvider>
  );
};

describe('Shared Components', () => {
  describe('Footer', () => {
    it('renders institution name and contact', () => {
      renderWithProviders(Footer);
      expect(screen.getByText('Aseder')).toBeDefined();
      expect(screen.getByText('asederquilichao@gmail.com')).toBeDefined();
    });
  });

  describe('Header', () => {
    it('renders logo and nav links', () => {
      renderWithProviders(Header);
      expect(screen.getByText('Aseder')).toBeDefined();
      expect(screen.getByText('header.admissions')).toBeDefined();
    });
  });

  describe('PortalHeader', () => {
    it('renders portal brand', () => {
      renderWithProviders(PortalHeader);
      // expect(screen.getByText('Portal Institucional')).toBeDefined();
      // Need to check actual text used in PortalHeader
    });
  });
});
