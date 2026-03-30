import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Mantine
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Modal: ({ children, opened }: any) => (
      opened ? <div data-testid="mock-modal">{children}</div> : null
    ),
    Select: ({ label, data, value, onChange, placeholder }: any) => (
      <div data-testid="mock-select">
        <label>{label}
          <input 
            aria-label={label}
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder={placeholder}
          />
        </label>
      </div>
    )
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgramForm } from '../ProgramForm';
import { AuthContext } from '../../../context/AuthContext';
import { MantineProvider } from '@mantine/core';
import { theme } from '../../../theme';

const mockAuthValue = {
  user: { 
    id: '1', 
    memberships: [{ tenant_id: 't1', tenant_name: 'Inst 1' }] 
  },
  token: 'token',
};

const renderForm = (props = {}) => {
  return render(
    <MantineProvider theme={theme}>
      <AuthContext.Provider value={mockAuthValue as any}>
        <ProgramForm onSuccess={vi.fn()} {...props} />
      </AuthContext.Provider>
    </MantineProvider>
  );
};

describe('ProgramForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));
  });

  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText(/portal\.programsManagement\.form\.name/, { selector: 'input' })).toBeDefined();
    expect(screen.getByLabelText(/portal\.programsManagement\.form\.programType/, { selector: 'input' })).toBeDefined();
    expect(screen.getByText('portal.programsManagement.form.submit')).toBeDefined();
  });

  it('shows validation errors for empty required fields', async () => {
    renderForm();
    const submitBtn = screen.getByText('portal.programsManagement.form.submit');
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('common.error.tooShort')).toBeDefined();
    });
  });

  it('handles successful submission (Create)', async () => {
    const onSuccess = vi.fn();
    renderForm({ onSuccess });

    fireEvent.change(screen.getByLabelText(/portal\.programsManagement\.form\.name/, { selector: 'input' }), { target: { value: 'New Program' } });
    fireEvent.change(screen.getByLabelText(/portal\.programsManagement\.form\.programType/, { selector: 'input' }), { target: { value: 'K12' } });
    fireEvent.change(screen.getByLabelText(/portal\.programsManagement\.form\.degreeTitle/, { selector: 'input' }), { target: { value: 'Degree' } });
    
    const submitBtn = screen.getByText('portal.programsManagement.form.submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/academic/programs'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles successful submission (Edit)', async () => {
    const initialValues = {
      id: 'p1',
      name: 'Existing',
      program_type: 'Undergraduate',
      total_levels: 10,
      level_label: 'Semester',
      is_active: true,
      tenant_id: 't1'
    };
    const onSuccess = vi.fn();
    renderForm({ initialValues, onSuccess });

    expect(screen.getByDisplayValue('Existing')).toBeDefined();
    
    const submitBtn = screen.getByText('portal.programsManagement.form.submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/academic/programs/p1'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });
});
