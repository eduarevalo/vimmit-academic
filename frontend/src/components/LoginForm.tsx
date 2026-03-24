import { TextInput, PasswordInput, Button, Stack, Title, Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface LoginFormProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function LoginForm({ onSuccess, title, subtitle }: LoginFormProps) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) => (value.length < 6 ? 'Password is too short' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    try {
      await login(values.email, values.password);
      form.reset();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {title && <Title order={3} ta="center">{title}</Title>}
        {subtitle && <Text size="sm" c="dimmed" ta="center">{subtitle}</Text>}
        
        {error && (
          <Alert variant="light" color="red" title="Error" icon={<IconAlertCircle size={16} />}>
            {t(error)}
          </Alert>
        )}
        
        <TextInput
          label="Correo Electrónico"
          placeholder="tu@ejemplo.com"
          required
          {...form.getInputProps('email')}
        />
        
        <PasswordInput
          label="Contraseña"
          placeholder="Tu contraseña"
          required
          {...form.getInputProps('password')}
        />
        
        <Button type="submit" fullWidth mt="md" color="brand" radius="xl">
          Continuar
        </Button>
      </Stack>
    </form>
  );
}
