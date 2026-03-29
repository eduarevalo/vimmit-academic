import { Container, Paper, Title, Text, TextInput, Button, Group, Stack, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.errors.INVALID_EMAIL')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(values.email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'auth.errors.SYSTEM_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py={80}>
      <Paper withBorder shadow="xl" p={40} radius="lg">
        {!submitted ? (
          <Stack gap="md">
            <Title order={2} ta="center" fw={900}>
              {t('auth.forgotPassword.title')}
            </Title>
            <Text c="dimmed" fz="sm" ta="center">
              {t('auth.forgotPassword.instruction')}
            </Text>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label={t('auth.fields.email')}
                  placeholder={t('auth.placeholders.email')}
                  required
                  {...form.getInputProps('email')}
                />

                {error && (
                  <Text c="red" size="sm" ta="center">
                    {t(error)}
                  </Text>
                )}

                <Button type="submit" fullWidth loading={loading} radius="md" color="brand">
                  {t('auth.forgotPassword.submit')}
                </Button>
              </Stack>
            </form>

            <Group justify="center" mt="md">
              <Link to="/portal" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <IconArrowLeft size={16} style={{ marginRight: 8 }} />
                <Text size="sm" c="brand">
                  {t('auth.backToLogin')}
                </Text>
              </Link>
            </Group>
          </Stack>
        ) : (
          <Stack align="center" gap="md">
            <Center style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--mantine-color-green-1)' }}>
              <IconCheck size={30} color="var(--mantine-color-green-7)" />
            </Center>
            <Title order={3} ta="center">
              {t('auth.forgotPassword.successTitle')}
            </Title>
            <Text c="dimmed" ta="center" size="sm">
              {t('auth.forgotPassword.successMessage')}
            </Text>
            <Button component={Link} to="/portal" variant="light" fullWidth mt="md" radius="md">
              {t('auth.backToLogin')}
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
