import { Stack, TextInput, Alert, Text, Box, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Campus, Program, Calendar, EnrollmentForm } from './types';

interface StepPersonalDetailsProps {
  form: EnrollmentForm;
  loading: boolean;
}

export function StepPersonalDetails({ form, loading }: StepPersonalDetailsProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="xl" w="100%">
      <Box mt="xl">
        <Title order={1} ta="center" mb="xs">{t('registration.wizard.headerTitle')}</Title>
        <Text ta="center" c="dimmed" size="lg" mb="xl">
          {t('registration.wizard.headerSubtitle')}
        </Text>
      </Box>

      <Stack gap="lg">
        <Box>
          <Alert color="blue" radius="xs" icon={<IconInfoCircle size={20} />} mb="md">
            <Text size="sm">
              {t('registration.wizard.welcomeMessage')}
            </Text>
          </Alert>
        </Box>

        <TextInput
          label={t('registration.fields.fullName')}
          placeholder={t('registration.placeholders.fullName')}
          size="md"
          required
          disabled={loading}
          withErrorStyles={false}
          {...form.getInputProps('fullName')}
        />
        
        <TextInput
          label={t('registration.fields.email')}
          placeholder={t('registration.placeholders.email')}
          type="email"
          size="md"
          required
          disabled={loading}
          withErrorStyles={false}
          {...form.getInputProps('email')}
        />
        
        <TextInput
          label={t('registration.fields.phone')}
          placeholder={t('registration.placeholders.phone')}
          size="md"
          required
          disabled={loading}
          withErrorStyles={false}
          {...form.getInputProps('phone')}
        />
      </Stack>
    </Stack>
  );
}
