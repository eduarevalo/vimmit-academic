import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'tenantManagement.invitations.deleteConfirm') return `Delete ${params?.email}?`;
      return key;
    },
  }),
}));

// Mock React Router Params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ tenantId: 't1' }),
  };
});

// Mock Mantine with Select/Modal/Tabs fixes
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Modal: ({ children, opened }: any) => (
      opened ? <div data-testid="mock-modal">{children}</div> : null
    ),
    Select: ({ label, value, onChange }: any) => (
      <input aria-label={label} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    ),
    Tabs: Object.assign(
      ({ children, defaultValue }: any) => <div data-testid="mock-tabs">{children}</div>,
      {
        List: ({ children }: any) => <div>{children}</div>,
        Tab: ({ children, value }: any) => <button>{children}</button>,
        Panel: ({ children, value }: any) => <div>{children}</div>,
      }
    ),
    ActionIcon: ({ children, onClick, 'aria-label': ariaLabel }: any) => (
      <button onClick={onClick} aria-label={ariaLabel}>{children}</button>
    )
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TenantManagementPage } from '../TenantManagementPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from '../../theme';

const mockAuthValue = {
  user: { id: '1', email: 'admin@test.com', memberships: [{ tenant_id: 't1', tenant_name: 'Inst 1', role_name: 'Admin' }] },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  hasRole: () => true,
};

const renderPage = () => {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue as any}>
          <TenantManagementPage />
        </AuthContext.Provider>
      </MemoryRouter>
    </MantineProvider>
  );
};

describe('TenantManagement Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/members')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{ user_id: 'u1', email: 'user@test.com', first_name: 'Test', last_name: 'User', role_name: 'Admin' }])
        });
      }
      if (url.includes('/invitations') && !url.includes('resend') && !url.includes('inv1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{ id: 'inv1', email: 'invited@test.com', role_name: 'Member', status: 'PENDING', created_at: '2024-01-01' }])
        });
      }
      if (url.includes('/roles')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{ id: 'r1', name: 'Admin' }, { id: 'r2', name: 'Member' }])
        });
      }
      return Promise.resolve({ ok: true, json: async () => ([]) });
    }));
  });

  it('renders members and invitations list', async () => {
    renderPage();
    expect(await screen.findByText('user@test.com')).toBeDefined();
    expect(await screen.findByText('invited@test.com')).toBeDefined();
  });

  it('handles invitation resend', async () => {
    renderPage();
    await screen.findByText('invited@test.com');

    const resendBtn = screen.getByLabelText('tenantManagement.invitations.resend');
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/resend'), 
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('handles invitation deletion', async () => {
    renderPage();
    await screen.findByText('invited@test.com');

    const deleteBtn = screen.getByLabelText('tenantManagement.invitations.delete');
    fireEvent.click(deleteBtn);

    // Should open modal
    await waitFor(() => expect(screen.getByTestId('mock-modal')).toBeDefined());
    
    const confirmBtn = screen.getByText('common.delete');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/invitations/inv1'), 
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('handles invitation flow (Create)', async () => {
    renderPage();
    await screen.findByText('user@test.com');

    const inviteBtn = screen.getByText('tenantManagement.inviteCollaborator');
    fireEvent.click(inviteBtn);
    
    await waitFor(() => expect(screen.getByTestId('mock-modal')).toBeDefined());

    const emailInput = screen.getByPlaceholderText('colaborador@institucion.com');
    fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
    
    const roleInput = screen.getByLabelText('tenantManagement.role');
    fireEvent.change(roleInput, { target: { value: 'r1' } });

    const submitBtn = screen.getByText('tenantManagement.sendInvitation');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/invitations'), 
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
