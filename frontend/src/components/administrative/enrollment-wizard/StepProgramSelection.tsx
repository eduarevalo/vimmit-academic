import { Stack, Select, Textarea, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Campus, Program, Calendar, EnrollmentForm } from './types';

interface StepProgramSelectionProps {
  form: EnrollmentForm;
  loading: boolean;
  campuses: Campus[];
  programs: Program[];
  calendars: Calendar[];
  loadingCampuses: boolean;
  loadingPrograms: boolean;
  loadingCalendars: boolean;
}

export function StepProgramSelection({
  form,
  loading,
  campuses,
  programs,
  calendars,
  loadingCampuses,
  loadingPrograms,
  loadingCalendars,
}: StepProgramSelectionProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="xl" w="100%">
      <Title order={2} ta="center" mt="xl" mb="xl">{t('registration.steps.selection')}</Title>

      <Stack gap="lg">
        <Select
          label={t('registration.fields.campus')}
          placeholder={t('registration.fields.campusPlaceholder')}
          data={campuses.map(c => ({ value: c.id, label: c.name }))}
          disabled={loading || loadingCampuses}
          required
          size="md"
          withErrorStyles={false}
          {...form.getInputProps('campusId')}
        />

        <Select
          label={t('registration.fields.program')}
          placeholder={t('registration.fields.programPlaceholder')}
          data={programs.map(p => ({ value: p.id, label: p.name }))}
          disabled={loading || loadingPrograms || !form.values.campusId}
          required
          size="md"
          withErrorStyles={false}
          {...form.getInputProps('programId')}
        />

        <Select
          label={t('registration.fields.calendar')}
          placeholder={t('registration.fields.calendarPlaceholder')}
          data={calendars.map(c => ({ value: c.id, label: c.name }))}
          disabled={loading || loadingCalendars || !form.values.programId}
          required
          size="md"
          withErrorStyles={false}
          {...form.getInputProps('calendarId')}
        />
        
        <Textarea
          label={t('registration.fields.notes')}
          placeholder={t('registration.fields.notesPlaceholder')}
          minRows={3}
          size="md"
          disabled={loading}
          withErrorStyles={false}
          {...form.getInputProps('notes')}
        />
      </Stack>
    </Stack>
  );
}
