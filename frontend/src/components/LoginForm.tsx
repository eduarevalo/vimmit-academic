import { TextInput, PasswordInput, Button, Stack, Title, Text, Alert, Group, Anchor } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function LoginForm({ onSuccess, title, subtitle }: LoginFormProps) {
  const { t } = useTranslation();
  const { login, logoutMessage, setLogoutMessage } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : t('auth.errors.INVALID_EMAIL')),
      password: (value: string) => (value.length < 6 ? t('auth.errors.PASSWORD_TOO_SHORT_SIMPLE') : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLogoutMessage(null);
    try {
      await login(values.email, values.password);
      form.reset();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'auth.errors.LOGIN_FAILED');
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {title && <Title order={3} ta="center">{title}</Title>}
        {subtitle && <Text size="sm" c="dimmed" ta="center">{subtitle}</Text>}
        
        {error && (
          <Alert variant="light" color="red" icon={<IconAlertCircle size={16} />}>
            {t(error)}
          </Alert>
        )}

        {logoutMessage && !error && (
          <Alert variant="light" color="blue" icon={<IconAlertCircle size={16} />}>
            {t(logoutMessage)}
          </Alert>
        )}
        
        <TextInput
          label={t('auth.fields.email')}
          placeholder={t('auth.placeholders.email')}
          required
          {...form.getInputProps('email')}
        />
        
        <Stack gap={5}>
          <Group justify="space-between" mb={5}>
            <Text size="sm" fw={500}>{t('auth.fields.password')}</Text>
            <Anchor component={Link} to="/portal/forgot-password" size="xs" fw={700} c="brand">
              {t('auth.forgotPassword.link')}
            </Anchor>
          </Group>
          <PasswordInput
            placeholder={t('auth.placeholders.password')}
            required
            {...form.getInputProps('password')}
          />
        </Stack>
        
        <Button type="submit" fullWidth mt="md" color="brand" radius="xs">
          {t('auth.loginButton')}
        </Button>
      </Stack>
    </form>
  );
}
