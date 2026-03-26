import { TextInput, Textarea, Checkbox, Button, Stack, Group, Select, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = 'http://localhost:8000';

interface ProgramFormProps {
  initialValues?: any;
  onSuccess: () => void;
}

export function ProgramForm({ initialValues, onSuccess }: ProgramFormProps) {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const institutionOptions = user?.memberships.map(m => ({
    value: m.tenant_id,
    label: m.tenant_name
  })) || [];

  const programTypeOptions = [
    { value: 'K12',       label: t('portal.programsManagement.form.programTypeK12') },
    { value: 'TECHNICAL', label: t('portal.programsManagement.form.programTypeTechnical') },
  ];

  const form = useForm({
    initialValues: initialValues || {
      name: '',
      description: '',
      program_type: '',
      total_levels: 1,
      level_label: 'Level',
      degree_title: '',
      credits_per_level: null,
      tenant_id: initialValues?.tenant_id || institutionOptions[0]?.value || '',
      is_active: initialValues?.is_active ?? true,
    },
    validate: {
      name:         (v) => (v.length < 2 ? t('common.error.tooShort') : null),
      program_type: (v) => (!v ? t('portal.programsManagement.form.programTypeRequired') : null),
      tenant_id:    (v) => (institutionOptions.length > 0 && !v ? t('portal.programsManagement.form.institutionRequired') : null),
      total_levels: (v) => (!v || v < 1 ? t('portal.programsManagement.form.totalLevelsMin') : null),
    },
  });

  const isTechnical = form.values.program_type === 'TECHNICAL';

  const handleSubmit = async (values: any) => {
    if (!token) return;
    try {
      const url = `${API_BASE_URL}/api/v1/academic/programs` + (initialValues ? `/${initialValues.id}` : '');
      const method = initialValues ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          credits_per_level: isTechnical ? values.credits_per_level : null,
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  return (
    <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">

        {/* Institution — hidden when user has only one */}
        {institutionOptions.length > 1 && (
          <Select
            label={t('portal.programsManagement.form.institution')}
            placeholder={t('portal.programsManagement.form.institutionPlaceholder')}
            data={institutionOptions}
            disabled={!!initialValues}
            required
            {...form.getInputProps('tenant_id')}
          />
        )}

        {/* Program type */}
        <Select
          label={t('portal.programsManagement.form.programType')}
          placeholder={t('portal.programsManagement.form.programTypePlaceholder')}
          data={programTypeOptions}
          disabled={!!initialValues}
          required
          {...form.getInputProps('program_type')}
        />

        {/* Name */}
        <TextInput
          label={t('portal.programsManagement.form.name')}
          placeholder={t('portal.programsManagement.form.namePlaceholder')}
          required
          {...form.getInputProps('name')}
        />

        {/* Description */}
        <Textarea
          label={t('portal.programsManagement.form.description')}
          placeholder={t('portal.programsManagement.form.descriptionPlaceholder')}
          rows={3}
          {...form.getInputProps('description')}
        />

        {/* Total levels + level label */}
        <Group grow>
          <NumberInput
            label={t('portal.programsManagement.form.totalLevels')}
            description={t('portal.programsManagement.form.totalLevelsDescription')}
            min={1}
            required
            {...form.getInputProps('total_levels')}
          />
          <TextInput
            label={t('portal.programsManagement.form.levelLabel')}
            placeholder={t('portal.programsManagement.form.levelLabelPlaceholder')}
            {...form.getInputProps('level_label')}
          />
        </Group>

        {/* Degree title */}
        <TextInput
          label={t('portal.programsManagement.form.degreeTitle')}
          placeholder={t('portal.programsManagement.form.degreeTitlePlaceholder')}
          {...form.getInputProps('degree_title')}
        />

        {/* Credits per level — Technical only */}
        {isTechnical && (
          <NumberInput
            label={t('portal.programsManagement.form.creditsPerLevel')}
            min={0}
            {...form.getInputProps('credits_per_level')}
          />
        )}

        {/* Active */}
        <Checkbox
          label={t('portal.programsManagement.form.active')}
          {...form.getInputProps('is_active', { type: 'checkbox' })}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" color="brand">
            {t('portal.programsManagement.form.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
