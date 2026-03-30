import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { AuthContext } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockLogin = vi.fn();

import { MantineProvider } from '@mantine/core';

const renderLoginForm = (loginFn = mockLogin) => {
  return render(
    <MantineProvider>
      <BrowserRouter>
        <AuthContext.Provider value={{ 
          login: loginFn,
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          logout: vi.fn(),
          forgotPassword: vi.fn(),
          resetPassword: vi.fn(),
          changePassword: vi.fn(),
          updateProfile: vi.fn(),
          hasRole: vi.fn(),
          logoutMessage: null,
          setLogoutMessage: vi.fn(),
        }}>
          <LoginForm />
        </AuthContext.Provider>
      </BrowserRouter>
    </MantineProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form fields', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('auth.placeholders.email')).toBeDefined();
    expect(screen.getByPlaceholderText('auth.placeholders.password')).toBeDefined();
    expect(screen.getByRole('button', { name: /auth.loginButton/i })).toBeDefined();
  });

  it('calls login function with credentials', async () => {
    renderLoginForm();
    
    fireEvent.change(screen.getByPlaceholderText('auth.placeholders.email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('auth.placeholders.password'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /auth.loginButton/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message on failed login', async () => {
    const errorLogin = vi.fn().mockRejectedValue(new Error('auth.errors.INVALID_CREDENTIALS'));
    renderLoginForm(errorLogin);
    
    fireEvent.change(screen.getByPlaceholderText('auth.placeholders.email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('auth.placeholders.password'), {
      target: { value: 'wrongpass' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /auth.loginButton/i }));
    
    await waitFor(() => {
      expect(screen.getByText('auth.errors.INVALID_CREDENTIALS')).toBeDefined();
    });
  });
});
