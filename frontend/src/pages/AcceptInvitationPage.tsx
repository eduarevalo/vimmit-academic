import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Group, 
  Loader, 
  Alert,
  ThemeIcon,
  Box,
  Divider,
  Badge,
  PasswordInput,
  TextInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconCheck, 
  IconAlertCircle, 
  IconMail, 
  IconUserCheck,
  IconArrowRight,
  IconShieldCheck
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';

interface Invitation {
  id: string;
  email: string;
  tenant_id: string;
  role_id: string;
  role_name: string;
  tenant_name?: string;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED';
  user_exists: boolean;
}

export function AcceptInvitationPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const invitationToken = searchParams.get('token');
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  const registrationForm = useForm({
    initialValues: {
      password: '',
      first_name: '',
      last_name: '',
    },
    validate: {
      password: (val) => (val.length < 6 ? t('auth.errors.PASSWORD_TOO_SHORT') : null),
      first_name: (val) => (val.trim() === '' ? t('common.fieldRequired') : null),
      last_name: (val) => (val.trim() === '' ? t('common.fieldRequired') : null),
    }
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationToken) {
        setError('No invitation token provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/v1/identity/auth/invitations/${invitationToken}`);
        if (!response.ok) {
          throw new Error('AUTH_INVALID_TOKEN');
        }
        const data = await response.json();
        setInvitation(data);
        
        // Check if already member
        // Only set already member if the email matches. 
        // If emails don't match, we want the "Conflicto de cuenta" UI to show instead.
        if (
          user && 
          user.email.toLowerCase() === data.email.toLowerCase() && 
          user.memberships.some(m => m.tenant_id === data.tenant_id)
        ) {
          setError('ALREADY_MEMBER');
        }
      } catch (err: any) {
        setError(err.message === 'AUTH_INVALID_TOKEN' ? 'auth.errors.AUTH_INVALID_TOKEN' : 'auth.errors.SYSTEM_ERROR');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchInvitation();
    }
  }, [invitationToken, authLoading, user]);

  const handleLogoutAndSwitch = () => {
    logout();
    window.location.reload();
  };

  const handleAccept = async (values?: typeof registrationForm.values) => {
    if (!invitationToken) return;
    
    setIsAccepting(true);
    try {
      const payload: any = { token: invitationToken };
      if (values) {
        payload.password = values.password;
        payload.first_name = values.first_name;
        payload.last_name = values.last_name;
      }

      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/v1/identity/auth/invitations/accept`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        // If we registered, we might want to reload to get the new session
        // or just redirect to login if auto-login is not implemented yet
        if (values) {
          // New user path - they need to login now with their new password
          // unless we want to auto-login. For now, refresh or redirect.
          window.location.reload();
        } else {
          // Existing user path - refresh profile
          window.location.reload();
        }
      } else {
        const data = await response.json();
        setError(data.detail?.code || 'auth.errors.SYSTEM_ERROR');
      }
    } catch (err: any) {
      setError('auth.errors.SYSTEM_ERROR');
    } finally {
      setIsAccepting(false);
    }
  };

  const isEmailMismatch = isAuthenticated && user && invitation && user.email.toLowerCase() !== invitation.email.toLowerCase();

  if (authLoading || isLoading) {
    return (
      <Container size="xs" py={100}>
        <Stack align="center">
          <Loader size="xl" color="brand" variant="dots" />
          <Text c="dimmed">Cargando invitación...</Text>
        </Stack>
      </Container>
    );
  }

  if (error === 'ALREADY_MEMBER') {
    return (
      <Container size="xs" py={100}>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ textAlign: 'center' }}>
          <ThemeIcon size={60} radius="xl" color="green" variant="light" mb="md">
            <IconCheck size={32} />
          </ThemeIcon>
          <Title order={2} mb="sm">{t('tenantManagement.acceptInvitation.alreadyMember')}</Title>
          <Text c="dimmed" mb="xl">Ya tienes acceso a esta institución.</Text>
          <Button component={Link} to="/portal/profile" fullWidth radius="md">
            Ir a mi Perfil
          </Button>
        </Paper>
      </Container>
    );
  }

  if (error || !invitation) {
    return (
      <Container size="xs" py={100}>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ textAlign: 'center' }}>
          <ThemeIcon size={60} radius="xl" color="red" variant="light" mb="md">
            <IconAlertCircle size={32} />
          </ThemeIcon>
          <Title order={2} mb="sm">Invitación Inválida</Title>
          <Text c="dimmed" mb="xl">
            {error ? t(error) : 'Esta invitación ya no es válida o ha sido cancelada.'}
          </Text>
          <Button component={Link} to="/" fullWidth variant="light" radius="md">
            Volver al Inicio
          </Button>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container size="xs" py={100}>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ textAlign: 'center' }}>
          <ThemeIcon size={60} radius="xl" color="green" variant="light" mb="md">
            <IconShieldCheck size={32} />
          </ThemeIcon>
          <Title order={2} mb="sm">{t('tenantManagement.acceptInvitation.success')}</Title>
          <Text c="dimmed" mb="xl">Ahora eres parte de la institución con el rol de <strong>{invitation.role_name}</strong>.</Text>
          <Button component={Link} to="/portal/profile" fullWidth radius="md" rightSection={<IconArrowRight size={16} />}>
            Explorar Mi Perfil
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" py={100}>
      <Paper withBorder shadow="md" p={30} radius="md" style={{ position: 'relative' }}>
        <Box mb="xl">
          <ThemeIcon size={50} radius="md" color="brand" variant="light" mb="md">
            <IconUserCheck size={28} />
          </ThemeIcon>
          <Title order={1} fw={900}>{t('tenantManagement.acceptInvitation.title')}</Title>
          <Text c="dimmed" size="lg">
            {t('tenantManagement.acceptInvitation.description', { 
              tenantName: invitation.tenant_name || 'una Institución', 
              roleName: invitation.role_name 
            })}
          </Text>
        </Box>

        <Divider my="xl" />

        <Stack gap="md">
          {isAuthenticated ? (
            <>
              {isEmailMismatch ? (
                <Stack gap="md">
                  <Alert icon={<IconAlertCircle size={16} />} title="Conflicto de cuenta" color="orange" variant="light">
                    Estás identificado como <strong>{user?.email}</strong>, pero esta invitación es para <strong>{invitation.email}</strong>.
                  </Alert>
                  <Button 
                    variant="outline" 
                    color="orange" 
                    fullWidth 
                    radius="md" 
                    onClick={handleLogoutAndSwitch}
                  >
                    Cerrar sesión y cambiar de cuenta
                  </Button>
                </Stack>
              ) : (
                <>
                  <Group justify="space-between" p="md" style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 'var(--mantine-radius-md)' }}>
                    <Group gap="sm">
                      <ThemeIcon size="sm" variant="light" color="brand">
                        <IconMail size={14} />
                      </ThemeIcon>
                      <Text size="sm" fw={500}>{user?.email}</Text>
                    </Group>
                    <Badge variant="dot" color="green">Cuenta Activa</Badge>
                  </Group>

                  <Button 
                    onClick={() => handleAccept()} 
                    loading={isAccepting} 
                    className="brand-button" 
                    size="lg" 
                    fullWidth 
                    radius="md"
                    mt="md"
                  >
                    {t('tenantManagement.acceptInvitation.accept')}
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {invitation.user_exists ? (
                <Stack gap="md">
                  <Alert icon={<IconAlertCircle size={16} />} title="Cuenta existente" color="blue" variant="light">
                    Ya existe una cuenta para <strong>{invitation.email}</strong>. Por favor, inicia sesión para aceptar la invitación.
                  </Alert>
                  <Button component={Link} to={`/portal?email=${invitation.email}`} fullWidth radius="md" size="lg">
                    {t('auth.login')}
                  </Button>
                </Stack>
              ) : (
                <form onSubmit={registrationForm.onSubmit(handleAccept)}>
                  <Stack gap="md">
                    <Alert icon={<IconUserCheck size={16} />} title="Nueva cuenta" color="brand" variant="light">
                      Estás a un paso de unirte. Crea tu cuenta para continuar.
                    </Alert>
                    
                    <Group grow>
                      <TextInput 
                        label={t('profile.fields.firstName')}
                        placeholder={t('profile.placeholders.firstName')}
                        required
                        {...registrationForm.getInputProps('first_name')}
                      />
                      <TextInput 
                        label={t('profile.fields.lastName')}
                        placeholder={t('profile.placeholders.lastName')}
                        required
                        {...registrationForm.getInputProps('last_name')}
                      />
                    </Group>

                    <PasswordInput
                      label={t('auth.fields.password')}
                      placeholder="********"
                      required
                      {...registrationForm.getInputProps('password')}
                    />

                    <Button 
                      type="submit" 
                      loading={isAccepting} 
                      className="brand-button" 
                      size="lg" 
                      fullWidth 
                      radius="md"
                      mt="md"
                    >
                      {t('tenantManagement.acceptInvitation.accept')}
                    </Button>
                  </Stack>
                </form>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
