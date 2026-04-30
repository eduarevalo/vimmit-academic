import type { UseFormReturnType } from '@mantine/form';

export interface RequiredDocument {
  name: string;
  is_required: boolean;
  physical_required: boolean;
  physical?: string;
  digital?: string;
}

export interface Program {
  id: string;
  name: string;
  required_documents: RequiredDocument[];
}

export interface Campus {
  id: string;
  name: string;
}

export interface Calendar {
  id: string;
  name: string;
  program_id: string;
  campus_id: string;
}

export interface EnrollmentFormValues {
  fullName: string;
  email: string;
  phone: string;
  campusId: string;
  programId: string;
  calendarId: string;
  notes: string;
}

export type EnrollmentForm = UseFormReturnType<EnrollmentFormValues>;
