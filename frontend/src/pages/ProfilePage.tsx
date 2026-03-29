import { Container, Paper, Title, Text, TextInput, Button, Stack, Group, Avatar, Tabs, PasswordInput, Divider, Loader, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { IconUser, IconLock, IconCheck, IconAlertCircle, IconMail, IconPhone } from '@tabler/icons-react';


export function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile, changePassword, isLoading } = useAuth();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileForm = useForm({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
    validate: {
      first_name: (val) => (val && val.length < 2 ? t('auth.errors.NAME_TOO_SHORT') : null),
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.setValues({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const passwordForm = useForm({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validate: {
      new_password: (val) => (val.length < 8 ? t('auth.errors.PASSWORD_TOO_SHORT') : null),
      confirm_password: (val, values) => (val !== values.new_password ? t('auth.errors.PASSWORD_MISMATCH') : null),
    },
  });

  const handleUpdateProfile = async (values: typeof profileForm.values) => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      await updateProfile(values);
      setProfileSuccess(true);
    } catch (err: any) {
      setProfileError(err.message || 'auth.errors.SYSTEM_ERROR');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (values: typeof passwordForm.values) => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await changePassword(values.current_password, values.new_password);
      setPasswordSuccess(true);
      passwordForm.reset();
    } catch (err: any) {
      setPasswordError(err.message || 'auth.errors.SYSTEM_ERROR');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <Container size="md" py={100}>
        <Stack align="center">
          <Loader size="xl" color="brand" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py={60}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={0}>
            <Title order={1} fw={900}>{t('profile.title')}</Title>
            <Text c="dimmed">{t('profile.subtitle')}</Text>
          </Stack>
        </Group>

        <Paper withBorder shadow="sm" radius="md" p={30}>
          <Group gap="xl" mb={40}>
            <Avatar size={100} radius="100%" color="brand">
              {user.first_name ? user.first_name[0] : user.email[0]}
            </Avatar>
            <Stack gap={5}>
              <Title order={2}>{user.first_name || ''} {user.last_name || ''}</Title>
              <Group gap="xs">
                <IconMail size={16} color="var(--mantine-color-dimmed)" />
                <Text c="dimmed">{user.email}</Text>
              </Group>
              <Group gap="xs">
                <IconUser size={16} color="var(--mantine-color-dimmed)" />
                <Text c="dimmed" fz="sm">ID: {user.id.substring(0, 8)}...</Text>
              </Group>
            </Stack>
          </Group>

          <Tabs defaultValue="account" color="brand" variant="underline">
            <Tabs.List mb="xl">
              <Tabs.Tab value="account" leftSection={<IconUser size={16} />}>
                {t('profile.tabs.account')}
              </Tabs.Tab>
              <Tabs.Tab value="security" leftSection={<IconLock size={16} />}>
                {t('profile.tabs.security')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="account">
              <form onSubmit={profileForm.onSubmit(handleUpdateProfile)}>
                <Stack gap="md">
                  <Group grow>
                    <TextInput
                      label={t('profile.fields.firstName')}
                      placeholder="Juan"
                      {...profileForm.getInputProps('first_name')}
                    />
                    <TextInput
                      label={t('profile.fields.lastName')}
                      placeholder="Pérez"
                      {...profileForm.getInputProps('last_name')}
                    />
                  </Group>
                  <TextInput
                    label={t('profile.fields.phone')}
                    placeholder="+54 11 1234 5678"
                    leftSection={<IconPhone size={16} />}
                    {...profileForm.getInputProps('phone')}
                  />
                  
                  {profileError && (
                    <Alert variant="light" color="red" icon={<IconAlertCircle size={16} />}>
                      {t(profileError)}
                    </Alert>
                  )}
                  
                  {profileSuccess && (
                    <Alert variant="light" color="green" icon={<IconCheck size={16} />}>
                      {t('profile.updatedMessage')}
                    </Alert>
                  )}
                  
                  <Divider my="sm" />
                  
                  <Group justify="flex-end">
                    <Button type="submit" loading={profileLoading} radius="md" px={30}>
                      {t('profile.saveChanges')}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="security">
              <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
                <Stack gap="md" style={{ maxWidth: 500 }}>
                  <PasswordInput
                    label={t('profile.fields.currentPassword')}
                    required
                    {...passwordForm.getInputProps('current_password')}
                  />
                  <PasswordInput
                    label={t('profile.fields.newPassword')}
                    required
                    {...passwordForm.getInputProps('new_password')}
                  />
                  <PasswordInput
                    label={t('profile.fields.confirmPassword')}
                    required
                    {...passwordForm.getInputProps('confirm_password')}
                  />
                  
                  {passwordError && (
                    <Alert variant="light" color="red" icon={<IconAlertCircle size={16} />}>
                      {t(passwordError)}
                    </Alert>
                  )}
                  
                  {passwordSuccess && (
                    <Alert variant="light" color="green" icon={<IconCheck size={16} />}>
                      {t('profile.passwordChangedMessage')}
                    </Alert>
                  )}
                  
                  <Divider my="sm" />
                  
                  <Group justify="flex-end">
                    <Button type="submit" color="brand" loading={passwordLoading} radius="md">
                      {t('profile.changePassword')}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Paper>
        
        {user.memberships.length > 0 && (
          <Paper withBorder shadow="sm" radius="md" p={30}>
            <Title order={3} mb="md">{t('profile.membershipsTitle')}</Title>
            <Stack>
              {user.memberships.map((membership, idx) => (
                <Group key={idx} justify="space-between" p="md" style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 'var(--mantine-radius-md)' }}>
                  <Stack gap={0}>
                    <Text fw={700}>{membership.tenant_name}</Text>
                    <Text size="sm" c="dimmed">{t('profile.tenantId')}: {membership.tenant_id}</Text>
                  </Stack>
                  <Alert color="brand" py={5} px={15} radius="xl">
                    <Text fw={600} size="sm">{membership.role_name}</Text>
                  </Alert>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
