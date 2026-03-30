import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Mantine Modal/Select to render children directly
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Modal: ({ children }: any) => (
      <div data-testid="mock-modal">{children}</div>
    ),
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CampusPage } from '../CampusPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from '../../theme';

const mockAuthValue = {
  user: { 
    id: '1', 
    email: 'admin@test.com', 
    first_name: 'Admin', 
    memberships: [{ tenant_id: 't1', tenant_name: 'Inst 1', role_name: 'Admin' }] 
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  hasRole: (roles: string[]) => roles.includes('Admin'),
  logoutMessage: null,
  setLogoutMessage: vi.fn(),
};

const renderPage = (Component: React.ComponentType) => {
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

describe('Organization Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/organization/campuses')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 'cp1', name: 'Campus 1', code: 'C1', address: 'Main St', city: 'City', is_active: true, tenant_name: 'Inst 1' }
          ]
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
  });

  describe('CampusPage', () => {
    it('renders list of campuses', async () => {
      renderPage(CampusPage);
      expect(await screen.findByText('Campus 1')).toBeDefined();
      expect(screen.getByText('C1')).toBeDefined();
    });

    it('opens create modal with correct keys', async () => {
      renderPage(CampusPage);
      const createBtn = await screen.findByText('portal.campus.add');
      fireEvent.click(createBtn);
      
      // Wait for modal to appear and show form fields
      await waitFor(() => {
        expect(screen.getByText('portal.campus.form.name')).toBeDefined();
        expect(screen.getByText('portal.campus.form.code')).toBeDefined();
      });
    });
  });
});
