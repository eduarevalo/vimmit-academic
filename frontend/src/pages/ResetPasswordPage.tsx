import { Container, Paper, Title, Text, PasswordInput, Button, Stack, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { IconCheck, IconLock, IconSchool } from '@tabler/icons-react';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('auth.errors.INVALID_TOKEN');
    }
  }, [token]);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (val) => (val.length < 8 ? t('auth.errors.PASSWORD_TOO_SHORT') : null),
      confirmPassword: (val, values) => (val !== values.password ? t('auth.errors.PASSWORD_MISMATCH') : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await resetPassword(token, values.password);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'auth.errors.SYSTEM_ERROR');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !submitted) {
    return (
      <Container size="xs" py={80}>
        <Paper withBorder shadow="md" p={30} radius="xs">
          <Title order={2} ta="center" c="red">{t('auth.errors.INVALID_TOKEN_TITLE')}</Title>
          <Text ta="center" mt="md">{t('auth.errors.INVALID_TOKEN_MESSAGE')}</Text>
          <Button fullWidth mt="xl" component={Link} to="/portal">
            {t('auth.backToLogin')}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" py={80}>
      <Paper withBorder shadow="xl" p={40} radius="xs" bg="white">
        {!submitted ? (
          <Stack gap="xl">
            <Center mb="sm">
              <Group gap="xs">
                <Box 
                  bg="brand.6" 
                  p={4} 
                  style={{ borderRadius: 'var(--mantine-radius-xs)', display: 'flex' }}
                >
                  <IconSchool color="white" size={28} />
                </Box>
                <Title order={3} fw={900} style={{ letterSpacing: -1 }}>Aseder</Title>
              </Group>
            </Center>
            
            <Stack gap="xs">
              <Title order={3} fw={800} ta="center" style={{ letterSpacing: -0.5 }}>
                {t('auth.resetPassword.title')}
              </Title>
              <Text c="brand.4" size="sm" ta="center">
                {t('auth.resetPassword.instruction')}
              </Text>
            </Stack>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <PasswordInput
                  label={t('auth.fields.newPassword')}
                  placeholder={t('auth.placeholders.newPassword')}
                  required
                  {...form.getInputProps('password')}
                />
                <PasswordInput
                  label={t('auth.fields.confirmPassword')}
                  placeholder={t('auth.placeholders.confirmPassword')}
                  required
                  {...form.getInputProps('confirmPassword')}
                />

                {error && (
                  <Text c="red" size="sm" ta="center">
                    {t(error)}
                  </Text>
                )}

                <Button type="submit" fullWidth loading={loading} radius="xs" color="brand" mt="md">
                  {t('auth.resetPassword.submit')}
                </Button>
              </Stack>
            </form>
          </Stack>
        ) : (
          <Stack align="center" gap="md">
            <Center style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--mantine-color-green-1)' }}>
              <IconCheck size={30} color="var(--mantine-color-green-7)" />
            </Center>
            <Title order={3} ta="center">
              {t('auth.resetPassword.successTitle')}
            </Title>
            <Text c="dimmed" ta="center" size="sm">
              {t('auth.resetPassword.successMessage')}
            </Text>
            <Button component={Link} to="/portal" variant="light" fullWidth mt="md" radius="xs">
              {t('auth.backToLogin')}
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
