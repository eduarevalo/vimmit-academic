/**
 * Centralized mock data for Playwright E2E tests.
 * These mocks replicate the shape of all API responses consumed by the EnrollmentWizard.
 */

export const MOCK_TENANT_SLUG = 'aseder';

export const MOCK_CAMPUSES = [
  { id: 'campus-test-1', name: 'Sede Principal' },
];

export const MOCK_PROGRAMS = [
  {
    id: 'prog-test-1',
    name: 'Auxiliar en Enfermería',
    required_documents: [
      {
        name: 'Cédula de Ciudadanía',
        is_required: true,
        physical_required: false,
        digital: 'PDF o imagen del documento de identidad',
      },
      {
        name: 'Diploma de Bachillerato',
        is_required: true,
        physical_required: false,
        digital: 'PDF del diploma o acta de grado',
      },
    ],
  },
];

export const MOCK_CALENDARS = [
  {
    id: 'cal-test-1',
    name: '2026 – Auxiliar en Enfermería (Bogotá)',
    program_id: 'prog-test-1',
    campus_id: 'campus-test-1',
  },
];

export const MOCK_ADMISSION = {
  id: 'adm-test-11111111-1111-1111-1111-111111111111',
  full_name: 'Juan Perez',
  email: 'juan@example.com',
  phone: '+573001234567',
  campus_id: 'campus-test-1',
  program_id: 'prog-test-1',
  calendar_id: 'cal-test-1',
  status: 'PENDING',
  tenant_id: 'tenant-test-1',
  notes: null,
  attachments: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
