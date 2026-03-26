import React, { createContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface Membership {
  tenant_id: string;
  tenant_name: string;
  role_id: string;
  role_name: string;
}

interface User {
  id: string;
  email: string;
  is_active: boolean;
  memberships: Membership[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[], tenantId?: string) => boolean;
  logoutMessage: string | null;
  setLogoutMessage: (msg: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/identity/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(authToken);
      } else {
        localStorage.removeItem('access_token');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      localStorage.removeItem('access_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/identity/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const detail = errorData.detail;
      if (typeof detail === 'object' && detail.code) {
        throw new Error(`auth.errors.${detail.code}`);
      }
      throw new Error('auth.errors.SYSTEM_ERROR');
    }

    const { access_token } = await response.json();
    localStorage.setItem('access_token', access_token);
    await fetchUserProfile(access_token);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
  };

  const hasRole = (roles: string[], tenantId?: string) => {
    if (!user) return false;
    // If no tenantId provided, check if they have the role in ANY of their memberships
    if (!tenantId) {
      return user.memberships.some(m => roles.includes(m.role_name));
    }
    // Specific tenant check
    const m = user.memberships.find(m => m.tenant_id === tenantId);
    return m ? roles.includes(m.role_name) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        logoutMessage,
        setLogoutMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
