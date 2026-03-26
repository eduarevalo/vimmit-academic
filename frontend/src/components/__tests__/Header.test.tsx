import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../Header';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useInstitution
vi.mock('../../hooks/useInstitution', () => ({
  useInstitution: () => ({
    name: 'Aseder',
    loading: false,
  }),
}));

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

describe('Header Component', () => {
  it('renders institution name', () => {
    render(
      <MantineProvider>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </MantineProvider>
    );
    
    expect(screen.getByText('Aseder')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <MantineProvider>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </MantineProvider>
    );
    
    expect(screen.getByText('header.about')).toBeInTheDocument();
    expect(screen.getByText('header.programs')).toBeInTheDocument();
  });
});
