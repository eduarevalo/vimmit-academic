import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'portal.programsManagement.deleteConfirm.message') return `Delete ${params?.name}?`;
      return key;
    },
  }),
}));

// Robust mock for Mantine components
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Modal: ({ children, opened, title }: any) => (
      opened ? <div data-testid="mock-modal"><h3 data-testid="modal-title">{title}</h3><div data-testid="modal-content">{children}</div></div> : null
    ),
    Select: ({ label, value, onChange }: any) => (
      <input aria-label={label} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    ),
    ActionIcon: ({ children, onClick, 'aria-label': ariaLabel, title }: any) => (
      <button onClick={onClick} aria-label={ariaLabel || title}>{children}</button>
    )
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalendarsPage } from '../CalendarsPage';
import { AcademicProgramsPage } from '../AcademicProgramsPage';
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

describe('Academic Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/v1/academic/programs')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 'p1', name: 'Program 1', program_type: 'K12', is_active: true, tenant_name: 'Inst 1', tenant_id: 't1' }]
        });
      }
      if (url.includes('/v1/calendar/academic-periods')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ 
            id: 'c1', 
            name: 'Calendar 2024', 
            is_active: true, 
            tenant_name: 'Inst 1',
            tenant_id: 't1',
            program_id: 'p1',
            campus_id: 'cp1',
            start_date: '2024-01-01T00:00:00Z',
            end_date: '2024-12-31T00:00:00Z'
          }]
        });
      }
      if (url.includes('/v1/organization/campuses')) {
        return Promise.resolve({ ok: true, json: async () => [{ id: 'cp1', name: 'Campus 1', tenant_id: 't1' }] });
      }
      return Promise.resolve({ ok: true, json: async () => ([]) });
    }));
  });

  describe('CalendarsPage', () => {
    it('handles complete lifecycle', async () => {
      renderPage(CalendarsPage);
      expect(await screen.findByText('Calendar 2024')).toBeDefined();

      const editBtn = (await screen.findAllByRole('button')).find(b => b.innerHTML.includes('IconEdit')) || (await screen.findAllByRole('button'))[1];
      fireEvent.click(editBtn);
      await waitFor(() => expect(screen.getByTestId('mock-modal')).toBeDefined());
      
      const submitBtn = screen.getByText('portal.calendars.form.submit');
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
          expect.stringContaining('/v1/calendar/academic-periods/c1'), 
          expect.objectContaining({ method: 'PUT' })
        );
      });

      const deleteBtn = (await screen.findAllByRole('button')).find(b => b.innerHTML.includes('IconTrash')) || (await screen.findAllByRole('button'))[2];
      fireEvent.click(deleteBtn);
      await waitFor(() => expect(screen.getByText('portal.programsManagement.deleteConfirm.title')).toBeDefined());
      fireEvent.click(screen.getByText('common.delete'));

      await waitFor(() => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
          expect.stringContaining('/v1/calendar/academic-periods/c1'), 
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });

  describe('AcademicProgramsPage', () => {
    it('handles complete lifecycle', async () => {
      renderPage(AcademicProgramsPage);
      expect(await screen.findByText('Program 1')).toBeDefined();

      const createBtn = screen.getByText('portal.programsManagement.create');
      fireEvent.click(createBtn);
      await waitFor(() => expect(screen.getByTestId('mock-modal')).toBeDefined());

      // Test Delete
      const deleteBtn = (await screen.findAllByRole('button')).find(b => b.innerHTML.includes('IconTrash')) || (await screen.findAllByRole('button'))[2];
      fireEvent.click(deleteBtn);
      await waitFor(() => expect(screen.getByText('portal.programsManagement.deleteConfirm.title')).toBeDefined());
      fireEvent.click(screen.getByText('common.delete'));

      await waitFor(() => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
          expect.stringContaining('/v1/academic/programs/p1'), 
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });
});
