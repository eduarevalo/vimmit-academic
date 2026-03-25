import { TextInput, Textarea, Checkbox, Button, Stack, Group, Select } from '@mantine/core';
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

  const form = useForm({
    initialValues: initialValues || {
      name: '',
      description: '',
      duration: '',
      tenant_id: user?.memberships[0]?.tenant_id || '',
      is_active: true,
    },
    validate: {
      name: (value) => (value.length < 2 ? t('common.error.tooShort') : null),
      tenant_id: (value) => (!value ? t('portal.programsManagement.form.institutionRequired') : null),
    },
  });

  const handleSubmit = async (values: any) => {
    if (!token) return;
    try {
      const url = `${API_BASE_URL}/api/v1/academic/programs` + (initialValues ? `/${initialValues.id}` : '');
      const method = initialValues ? 'PUT' : 'POST'; 
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': values.tenant_id // Use the selected tenant ID
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
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
        <TextInput
          label={t('portal.programsManagement.form.name')}
          placeholder={t('portal.programsManagement.form.namePlaceholder')}
          required
          {...form.getInputProps('name')}
        />
        <Textarea
          label={t('portal.programsManagement.form.description')}
          placeholder={t('portal.programsManagement.form.descriptionPlaceholder')}
          rows={3}
          {...form.getInputProps('description')}
        />
        <TextInput
          label={t('portal.programsManagement.form.duration')}
          placeholder={t('portal.programsManagement.form.durationPlaceholder')}
          {...form.getInputProps('duration')}
        />
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
