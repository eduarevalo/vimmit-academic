import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useInstitution', () => ({
  useInstitution: () => ({ slug: 'test-slug' }),
}));

// Mock ResponsiveImage
vi.mock('../components/common/ResponsiveImage', () => ({
  ResponsiveImage: (props: any) => <img {...props} data-testid="responsive-image" />
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Mantine
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Skeleton: () => <div data-testid="mock-skeleton" />,
    Overlay: () => <div data-testid="mock-overlay" />,
    useMantineTheme: () => ({ shadows: { sm: 'sm', lg: 'lg' } }),
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgramsPage } from '../ProgramsPage';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from '../../theme';

describe('ProgramsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/academic/programs/public')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 'p1', name: 'Auxiliar en Enfermería', description: 'Nursing program' },
            { id: 'p2', name: 'Unknown Program', description: 'Other' }
          ]
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    }));
  });

  it('renders programs list successfully', async () => {
    render(
      <MantineProvider theme={theme}>
        <MemoryRouter>
          <ProgramsPage />
        </MemoryRouter>
      </MantineProvider>
    );

    expect(await screen.findByText('Auxiliar en Enfermería')).toBeDefined();
    expect(screen.getByText('Nursing program')).toBeDefined();
    expect(screen.getByText('Unknown Program')).toBeDefined();
    
    // Test navigation
    const nursingCard = screen.getByText('Auxiliar en Enfermería').closest('.mantine-Paper-root');
    if (nursingCard) {
      fireEvent.click(nursingCard);
      expect(mockNavigate).toHaveBeenCalledWith('/programs/nursing');
    }
  });

  it('renders loading state', () => {
    render(
      <MantineProvider theme={theme}>
        <MemoryRouter>
          <ProgramsPage />
        </MemoryRouter>
      </MantineProvider>
    );
    expect(screen.getAllByTestId('mock-skeleton')).toHaveLength(4);
  });

  it('renders error state when fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500
    } as any);

    render(
      <MantineProvider theme={theme}>
        <MemoryRouter>
          <ProgramsPage />
        </MemoryRouter>
      </MantineProvider>
    );

    expect(await screen.findByText('common.error.fetchPrograms')).toBeDefined();
  });
});
