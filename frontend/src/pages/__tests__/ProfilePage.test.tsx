import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Extremely simple mocks for Mantine to avoid JSDOM association issues
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  
  const SimpleTabs = ({ children }: any) => <div data-testid="mock-tabs">{children}</div>;
  SimpleTabs.List = ({ children }: any) => <div>{children}</div>;
  SimpleTabs.Tab = ({ children }: any) => <button>{children}</button>;
  SimpleTabs.Panel = ({ children, value }: any) => <div data-testid={`panel-${value}`}>{children}</div>;

  return {
    ...actual,
    Loader: () => <div data-testid="mock-loader">Loading...</div>,
    Tabs: SimpleTabs,
    TextInput: ({ label, ...props }: any) => (
      <label>
        {label}
        <input {...props} />
      </label>
    ),
    PasswordInput: ({ label, ...props }: any) => (
      <label>
        {label}
        <input {...props} type="password" />
      </label>
    ),
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePage } from '../ProfilePage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from '../../theme';

const mockAuthValue = {
  user: { 
    id: '1234567890', 
    email: 'test@example.com', 
    first_name: 'John', 
    last_name: 'Doe',
    phone: '123456',
    memberships: [
      { tenant_id: 't1', tenant_name: 'Institution 1', role_name: 'Admin' },
      { tenant_id: 't2', tenant_name: 'Institution 2', role_name: 'Member' }
    ]
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  updateProfile: vi.fn().mockResolvedValue({}),
  changePassword: vi.fn().mockResolvedValue({}),
};

const renderPage = (initialAuth = mockAuthValue) => {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={initialAuth as any}>
          <ProfilePage />
        </AuthContext.Provider>
      </MemoryRouter>
    </MantineProvider>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    renderPage({ ...mockAuthValue, isLoading: true, user: null } as any);
    expect(screen.getByTestId('mock-loader')).toBeDefined();
  });

  it('renders user details', async () => {
    renderPage();
    expect(screen.getByText(/John/)).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText('Institution 1')).toBeDefined();
  });

  it('handles profile update', async () => {
    renderPage();
    
    // Finding input via label-wrapping mock
    const firstNameInput = screen.getByLabelText('profile.fields.firstName');
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
    
    const submitBtn = screen.getByText('profile.saveChanges');
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(mockAuthValue.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
        first_name: 'Johnny'
      }));
      expect(screen.getByText('profile.updatedMessage')).toBeDefined();
    });
  });

  it('handles password change', async () => {
    renderPage();
    
    // Switch to security tab panels (both are rendered in our mock)
    const currentInput = screen.getByLabelText('profile.fields.currentPassword');
    const newInput = screen.getByLabelText('profile.fields.newPassword');
    const confirmInput = screen.getByLabelText('profile.fields.confirmPassword');
    
    fireEvent.change(currentInput, { target: { value: 'old' } });
    fireEvent.change(newInput, { target: { value: 'new-pass-123' } });
    fireEvent.change(confirmInput, { target: { value: 'new-pass-123' } });
    
    const changeBtn = screen.getByText('profile.changePassword');
    fireEvent.click(changeBtn);
    
    await waitFor(() => {
      expect(mockAuthValue.changePassword).toHaveBeenCalledWith('old', 'new-pass-123');
      expect(screen.getByText('profile.passwordChangedMessage')).toBeDefined();
    });
  });

  it('displays error message when profile update fails', async () => {
    const errorAuth = {
      ...mockAuthValue,
      updateProfile: vi.fn().mockRejectedValue(new Error('Update failed'))
    };
    renderPage(errorAuth as any);
    
    const submitBtn = screen.getByText('profile.saveChanges');
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeDefined();
    });
  });
});
