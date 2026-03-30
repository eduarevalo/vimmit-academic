import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'tenantManagement.acceptInvitation.successDesc') return `Success for ${params?.roleName}`;
      if (key === 'tenantManagement.acceptInvitation.accountConflictDesc') return `Conflict between ${params?.currentEmail} and ${params?.invitationEmail}`;
      return key;
    },
  }),
}));

// Mock Mantine with basic Inputs for JSDOM stability
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    TextInput: ({ label, ...props }: any) => <label>{label}<input {...props} /></label>,
    PasswordInput: ({ label, ...props }: any) => <label>{label}<input {...props} type="password" /></label>,
    Loader: () => <div>Loading...</div>
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AcceptInvitationPage } from '../AcceptInvitationPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from '../../theme';

// Mock useSearchParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams('token=mock-token')]),
  };
});

const mockInvitation = {
  id: 'inv1',
  email: 'newuser@test.com',
  tenant_id: 't1',
  tenant_name: 'Test Inst',
  role_name: 'Admin',
  user_exists: false,
  status: 'PENDING'
};

const mockAuthValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  logout: vi.fn(),
};

const renderPage = (auth = mockAuthValue) => {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={auth as any}>
          <AcceptInvitationPage />
        </AuthContext.Provider>
      </MemoryRouter>
    </MantineProvider>
  );
};

describe('AcceptInvitationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/invitations/mock-token') && !url.includes('accept')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockInvitation
        });
      }
      if (url.includes('/accept')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
    
    // Mock window.location.reload
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { reload: vi.fn() };
  });

  it('renders invitation details for NEW user', async () => {
    renderPage();
    expect(await screen.findByText('tenantManagement.acceptInvitation.newAccount')).toBeDefined();
    expect(screen.getByLabelText('profile.fields.firstName')).toBeDefined();
  });

  it('handles registration and acceptance for NEW user', async () => {
    renderPage();
    await screen.findByText('tenantManagement.acceptInvitation.newAccount');
    
    fireEvent.change(screen.getByLabelText('profile.fields.firstName'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('profile.fields.lastName'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('auth.fields.password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('tenantManagement.acceptInvitation.accept'));
    
    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/accept'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('handles account conflict (email mismatch)', async () => {
    const conflictAuth = {
      ...mockAuthValue,
      user: { email: 'logged-in@test.com' },
      isAuthenticated: true
    };
    renderPage(conflictAuth as any);
    
    expect(await screen.findByText(/Conflict between logged-in@test.com and newuser@test.com/)).toBeDefined();
    
    const logoutBtn = screen.getByText('tenantManagement.acceptInvitation.logoutAndSwitch');
    fireEvent.click(logoutBtn);
    
    expect(conflictAuth.logout).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('handles already member error', async () => {
    const alreadyMemberAuth = {
      ...mockAuthValue,
      user: { 
        email: 'newuser@test.com',
        memberships: [{ tenant_id: 't1' }]
      },
      isAuthenticated: true
    };
    renderPage(alreadyMemberAuth as any);
    
    expect(await screen.findByText('tenantManagement.acceptInvitation.alreadyMember')).toBeDefined();
  });

  it('handles acceptance failure', async () => {
    const loggedInAuth = {
      ...mockAuthValue,
      user: { email: 'newuser@test.com', memberships: [] },
      isAuthenticated: true
    };
    vi.mocked(fetch).mockImplementation((url) => {
      if (url.includes('/accept')) {
        return Promise.resolve({ ok: false, json: async () => ({ detail: { code: 'INVITATION_EXPIRED' } }) });
      }
      return Promise.resolve({ ok: true, json: async () => mockInvitation });
    });
    
    renderPage(loggedInAuth as any);
    
    const acceptBtn = await screen.findByText('tenantManagement.acceptInvitation.accept');
    fireEvent.click(acceptBtn);
    
    await waitFor(() => {
      expect(screen.getByText('INVITATION_EXPIRED')).toBeDefined();
    });
  });
});
