import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegistrationModal } from '../RegistrationModal';
import { MantineProvider } from '@mantine/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { theme } from '../../theme';

// Mock Mantine Modal to render children directly (bypasses portals)
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    Modal: ({ children, opened, title }: { children: React.ReactNode; opened: boolean; title?: React.ReactNode }) => (
      opened ? (
        <div data-testid="mock-modal">
          <div data-testid="modal-title">{title}</div>
          {children}
        </div>
      ) : null
    ),
  };
});

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockClose = vi.fn();

// Mock useRegistrationModal
vi.mock('../../hooks/useRegistrationModal', () => ({
  useRegistrationModal: () => ({
    isOpen: true,
    close: mockClose,
  }),
}));

describe('RegistrationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    }));
  });

  it('renders correctly when opened', () => {
    render(
      <MantineProvider>
        <RegistrationModal />
      </MantineProvider>
    );

    expect(screen.getByText('registration.title')).toBeDefined();
    expect(screen.getByPlaceholderText('juan.perez@email.com')).toBeDefined();
  });

  it('submits registration successfully', async () => {
    render(
      <MantineProvider theme={theme}>
        <RegistrationModal />
      </MantineProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('juan.perez@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'John Doe' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registration.submit/i }));

    await waitFor(() => {
      expect(screen.getByText('registration.success')).toBeDefined();
    });
  });
});
