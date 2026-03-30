import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useContext, useEffect } from 'react';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not Found' }),
    }));
  });

  const setupAuth = async (hasToken = false) => {
    if (hasToken) {
      localStorage.setItem('access_token', 'token');
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', email: 'test@test.com', memberships: [] }),
      } as Response);
    }

    const result = { current: null as any };
    const Grabber = () => {
      result.current = useContext(AuthContext);
      return null;
    };

    render(
      <AuthProvider>
        <Grabber />
      </AuthProvider>
    );

    await waitFor(() => expect(result.current?.isLoading).toBe(false));
    return result;
  };

  it('initializes correctly', async () => {
    const auth = await setupAuth();
    expect(auth.current.user).toBe(null);
    expect(auth.current.isAuthenticated).toBe(false);
  });

  it('handles login success', async () => {
    const auth = await setupAuth();
    
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', email: 'test@test.com', memberships: [] }),
      } as Response);

    await act(async () => {
      await auth.current.login('test@test.com', 'password');
    });

    await waitFor(() => expect(auth.current.user?.email).toBe('test@test.com'));
    expect(localStorage.getItem('access_token')).toBe('new-token');
  });

  it('handles login failure with variety of error formats', async () => {
    const auth = await setupAuth();
    
    // 1. Error with code
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: { code: 'INVALID' } }),
    } as Response);
    await expect(auth.current.login('t', 'w')).rejects.toThrow('auth.errors.INVALID');

    // 2. Error with string detail
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Something' }),
    } as Response);
    await expect(auth.current.login('t', 'w')).rejects.toThrow('auth.errors.SYSTEM_ERROR');
  });

  it('handles logout', async () => {
    const auth = await setupAuth(true);
    expect(auth.current.user).not.toBe(null);

    act(() => {
      auth.current.logout();
    });

    await waitFor(() => expect(auth.current.user).toBe(null));
    expect(localStorage.getItem('access_token')).toBe(null);
  });

  it('updateProfile success and error', async () => {
    const auth = await setupAuth(true);
    
    // Success
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', email: 'test@test.com', first_name: 'Updated', memberships: [] }),
    } as Response);

    await act(async () => {
      await auth.current.updateProfile({ first_name: 'Updated' });
    });

    await waitFor(() => expect(auth.current.user?.first_name).toBe('Updated'));

    // Error
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: { code: 'FAIL' } }),
    } as Response);
    await expect(auth.current.updateProfile({})).rejects.toThrow('auth.errors.FAIL');
  });

  it('changePassword success and error', async () => {
    const auth = await setupAuth(true);
    
    // Success
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
    await act(async () => {
      await auth.current.changePassword('old', 'new');
    });

    // Error
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: { code: 'WRONG' } }),
    } as Response);
    await expect(auth.current.changePassword('a', 'b')).rejects.toThrow('auth.errors.WRONG');
  });

  it('forgotPassword and resetPassword', async () => {
    const auth = await setupAuth();
    
    // Forgot Password
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
    await act(async () => {
      await auth.current.forgotPassword('email@test.com');
    });

    // Reset Password
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
    await act(async () => {
      await auth.current.resetPassword('token', 'new-pass');
    });
    
    // Reset Error
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: { code: 'EXPIRED' } }),
    } as Response);
    await expect(auth.current.resetPassword('t', 'p')).rejects.toThrow('auth.errors.EXPIRED');
  });

  it('hasRole logic deep dive', async () => {
    localStorage.setItem('access_token', 'token');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        id: '1', 
        memberships: [
          { tenant_id: 't1', role_name: 'Admin' },
          { tenant_id: 't2', role_name: 'Editor' }
        ] 
      }),
    } as Response);

    const auth = await setupAuth(); // setupAuth checks if token is set and mocks accordingly if we use hasToken parameter, but here I did it manually for custom memberships

    expect(auth.current.hasRole(['Admin'])).toBe(true);
    expect(auth.current.hasRole(['Admin'], 't1')).toBe(true);
    expect(auth.current.hasRole(['Admin'], 't2')).toBe(false);
    expect(auth.current.hasRole(['Editor'], 't2')).toBe(true);
    expect(auth.current.hasRole(['Viewer'])).toBe(false);
  });
});
