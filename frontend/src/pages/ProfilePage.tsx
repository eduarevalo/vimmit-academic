import { Container, Paper, TextInput, Button, Stack, Group, Avatar, Tabs, PasswordInput, Divider, Loader, Alert, Badge, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { IconUser, IconLock, IconCheck, IconAlertCircle, IconMail, IconPhone, IconSettings, IconBuildingCommunity } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from './ProfilePage.module.css';
import { PageHeader } from '../components/common/PageHeader';


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
      <Container size="lg" py={100}>
        <Stack align="center">
          <Loader size="xl" color="brand" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={t('profile.title')}
          subtitle={t('profile.subtitle')}
        />

        <Paper withBorder shadow="sm" radius="md" py={30} px={0}>
          <Group gap="xl" mb={40} px={30}>
            <Avatar size={100} radius="100%" color="brand">
              {user.first_name ? user.first_name[0] : user.email[0]}
            </Avatar>
            <Stack gap={5}>
              <Title order={2} fw={800}>{user.first_name || ''} {user.last_name || ''}</Title>
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

          <Tabs 
            defaultValue="account" 
            color="brand" 
            variant="outline"
            classNames={{
              tab: classes.tab,
            }}
          >
            <Tabs.List mb="xl" pl={30}>
              <Tabs.Tab value="account" leftSection={<IconUser size={18} />}>
                {t('profile.tabs.account')}
              </Tabs.Tab>
              <Tabs.Tab value="security" leftSection={<IconLock size={18} />}>
                {t('profile.tabs.security')}
              </Tabs.Tab>
              <Tabs.Tab value="memberships" leftSection={<IconBuildingCommunity size={18} />}>
                {t('profile.tabs.memberships')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="account" pt="md" px={30}>
              <form onSubmit={profileForm.onSubmit(handleUpdateProfile)}>
                <Stack gap="md">
                  <Group grow>
                    <TextInput
                      label={t('profile.fields.firstName')}
                      placeholder={t('profile.placeholders.firstName')}
                      radius="md"
                      {...profileForm.getInputProps('first_name')}
                    />
                    <TextInput
                      label={t('profile.fields.lastName')}
                      placeholder={t('profile.placeholders.lastName')}
                      radius="md"
                      {...profileForm.getInputProps('last_name')}
                    />
                  </Group>
                  <TextInput
                    label={t('profile.fields.phone')}
                    placeholder={t('profile.placeholders.phone')}
                    radius="md"
                    leftSection={<IconPhone size={16} />}
                    {...profileForm.getInputProps('phone')}
                  />
                  
                  {profileError && (
                    <Alert variant="light" color="red" icon={<IconAlertCircle size={16} />} radius="md">
                      {t(profileError)}
                    </Alert>
                  )}
                  
                  {profileSuccess && (
                    <Alert variant="light" color="green" icon={<IconCheck size={16} />} radius="md">
                      {t('profile.updatedMessage')}
                    </Alert>
                  )}
                  
                  <Divider my="sm" />
                  
                  <Group justify="flex-end">
                    <Button type="submit" loading={profileLoading} radius="md" px={40}>
                      {t('profile.saveChanges')}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="security" pt="md" px={30}>
              <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
                <Stack gap="md">
                  <PasswordInput
                    label={t('profile.fields.currentPassword')}
                    radius="md"
                    required
                    {...passwordForm.getInputProps('current_password')}
                  />
                  <PasswordInput
                    label={t('profile.fields.newPassword')}
                    radius="md"
                    required
                    {...passwordForm.getInputProps('new_password')}
                  />
                  <PasswordInput
                    label={t('profile.fields.confirmPassword')}
                    radius="md"
                    required
                    {...passwordForm.getInputProps('confirm_password')}
                  />
                  
                  {passwordError && (
                    <Alert variant="light" color="red" icon={<IconAlertCircle size={16} />} radius="md">
                      {t(passwordError)}
                    </Alert>
                  )}
                  
                  {passwordSuccess && (
                    <Alert variant="light" color="green" icon={<IconCheck size={16} />} radius="md">
                      {t('profile.passwordChangedMessage')}
                    </Alert>
                  )}
                  
                  <Divider my="sm" />
                  
                  <Group justify="flex-end">
                    <Button type="submit" color="brand" loading={passwordLoading} radius="md" px={40}>
                      {t('profile.changePassword')}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="memberships" pt="md" px={30}>
              <Stack gap="md">
                {user.memberships.length > 0 ? (
                  <Stack gap="sm">
                    {user.memberships.map((membership, idx) => (
                      <Paper key={idx} withBorder p="md" radius="md">
                        <Group justify="space-between">
                          <Stack gap={0}>
                            <Text fw={700} size="lg">{membership.tenant_name}</Text>
                            <Text size="sm" c="dimmed">{t('profile.tenantId')}: {membership.tenant_id}</Text>
                          </Stack>
                          <Group gap="sm">
                            <Badge color="brand" variant="light" size="lg" radius="sm">
                              {membership.role_name}
                            </Badge>
                            {membership.role_name === 'Admin' && (
                              <Button 
                                component={Link} 
                                to={`/portal/manage/${membership.tenant_id}`}
                                variant="filled" 
                                color="brand"
                                radius="md"
                                size="sm" 
                                leftSection={<IconSettings size={16} />}
                              >
                                {t('tenantManagement.manage')}
                              </Button>
                            )}
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Text c="dimmed" fs="italic">{t('profile.noMemberships')}</Text>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>

    </Container>
  );
}
