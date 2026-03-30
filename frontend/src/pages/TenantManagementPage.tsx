import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Text, 
  Paper, 
  Stack, 
  Group, 
  Button, 
  Table, 
  Badge, 
  ActionIcon, 
  Tooltip, 
  Modal, 
  TextInput, 
  Select, 
  Loader, 
  Alert,
  Tabs,
  Avatar,
  ThemeIcon,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconUserPlus, 
  IconUsers, 
  IconMail, 
  IconTrash, 
  IconCheck, 
  IconAlertCircle, 
  IconClock,
  IconArrowLeft,
  IconSend,
  IconRefresh
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';
import { PageHeader } from '../components/common/PageHeader';

interface Member {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  role_name: string;
}

interface Invitation {
  id: string;
  email: string;
  role_id: string;
  role_name: string;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED';
  created_at: string;
}

interface Role {
  id: string;
  name: string;
}

export function TenantManagementPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { t } = useTranslation();
  const { token } = useAuth();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingInvitation, setDeletingInvitation] = useState<Invitation | null>(null);

  const inviteForm = useForm({
    initialValues: {
      email: '',
      role_id: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.errors.INVALID_EMAIL')),
      role_id: (value) => (value ? null : t('common.fieldRequired')),
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId || '' };
      
      const [membersRes, invitesRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/v1/identity/tenants/${tenantId}/members`, { headers }),
        fetch(`${API_BASE_URL}/v1/identity/tenants/${tenantId}/invitations`, { headers }),
        fetch(`${API_BASE_URL}/v1/identity/tenants/${tenantId}/roles`, { headers }),
      ]);

      if (!membersRes.ok || !invitesRes.ok || !rolesRes.ok) {
        throw new Error('Failed to fetch management data');
      }

      const [membersData, invitesData, rolesData] = await Promise.all([
        membersRes.json(),
        invitesRes.json(),
        rolesRes.json(),
      ]);

      setMembers(membersData);
      setInvitations(invitesData);
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchData();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (tenantId && token) {
      init();
    }
  }, [tenantId, token]);

  const handleInvite = async (values: typeof inviteForm.values) => {
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/v1/identity/tenants/${tenantId}/invitations`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || ''
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setInviteSuccess(true);
        // Reset form but don't close modal immediately so user can see success
        inviteForm.reset();
        fetchData();
        // Optional: close after delay
        setTimeout(() => setInviteModalOpen(false), 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Failed to send invitation');
      }
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setResendingId(invitationId);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/identity/tenants/${tenantId}/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        },
      });

      if (response.ok) {
        // Optional: show a small toast or temporary success state
        // For now, let's just refresh to update any potential timestamps if we added them
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.detail?.message || 'Failed to resend invitation');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteInvitation = (invitation: Invitation) => {
    setDeletingInvitation(invitation);
  };

  const confirmDeleteInvitation = async () => {
    if (!deletingInvitation) return;
    const invitationId = deletingInvitation.id;
    
    setDeletingId(invitationId);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/identity/tenants/${tenantId}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        },
      });

      if (response.ok) {
        fetchData();
        setDeletingInvitation(null);
      } else {
        const errorData = await response.json();
        alert(errorData.detail?.message || 'Failed to delete invitation');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Container size="lg" py={100}>
        <Stack align="center">
          <Loader size="xl" color="brand" variant="dots" />
          <Text c="dimmed">{t('common.loading')}</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py={100}>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" variant="light">
          {error}
        </Alert>
        <Button mt="md" component={Link} to="/portal/profile" variant="outline" leftSection={<IconArrowLeft size={16} />}>
          {t('profile.title')}
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={t('tenantManagement.title')}
          subtitle={`ID: ${tenantId}`}
          withBackButton
          actions={
            <Button 
              leftSection={<IconUserPlus size={20} />} 
              onClick={() => setInviteModalOpen(true)}
              size="md"
              radius="md"
              className="brand-button"
            >
              {t('tenantManagement.inviteCollaborator')}
            </Button>
          }
        />

        <Paper withBorder shadow="sm" radius="lg">
          <Tabs defaultValue="members" color="brand" variant="pills" p="md">
            <Tabs.List mb="md" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
              <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>
                {t('tenantManagement.users')} ({members.length})
              </Tabs.Tab>
              <Tabs.Tab value="invitations" leftSection={<IconMail size={16} />}>
                {t('tenantManagement.invitations.title')} ({invitations.length})
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="members">
              {members.length === 0 ? (
                <Stack align="center" py={60} gap="sm">
                  <ThemeIcon size={60} radius="100%" variant="light" color="gray">
                    <IconUsers size={32} />
                  </ThemeIcon>
                  <Text fw={600} c="dimmed">{t('tenantManagement.noMembers')}</Text>
                </Stack>
              ) : (
                <Table.ScrollContainer minWidth={800}>
                  <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('tenantManagement.users')}</Table.Th>
                        <Table.Th>{t('tenantManagement.role')}</Table.Th>
                        <Table.Th>{t('tenantManagement.status')}</Table.Th>
                        <Table.Th style={{ width: 100 }}>{t('tenantManagement.actions')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {members.map((member) => (
                        <Table.Tr key={member.user_id}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar color="brand" radius="xl">
                                {member.first_name ? member.first_name[0] : member.email[0]}
                              </Avatar>
                              <Stack gap={0}>
                                <Text fw={600}>{member.first_name} {member.last_name}</Text>
                                <Text size="xs" c="dimmed">{member.email}</Text>
                              </Stack>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color={member.role_name === 'ADMIN' ? 'red' : 'blue'}>
                              {member.role_name}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="dot" color="green">Active</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label={t('common.delete')}>
                              <ActionIcon variant="subtle" color="red" disabled={member.role_name === 'ADMIN' && members.filter(m => m.role_name === 'ADMIN').length === 1}>
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="invitations">
              {invitations.length === 0 ? (
                <Stack align="center" py={60} gap="sm">
                  <ThemeIcon size={60} radius="100%" variant="light" color="gray">
                    <IconMail size={32} />
                  </ThemeIcon>
                  <Text fw={600} c="dimmed">{t('tenantManagement.noInvitations')}</Text>
                </Stack>
              ) : (
                <Table.ScrollContainer minWidth={800}>
                  <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('tenantManagement.email')}</Table.Th>
                        <Table.Th>{t('tenantManagement.role')}</Table.Th>
                        <Table.Th>{t('tenantManagement.status')}</Table.Th>
                        <Table.Th>Sent At</Table.Th>
                        <Table.Th style={{ width: 100 }}>{t('tenantManagement.actions')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {invitations.map((inv) => (
                        <Table.Tr key={inv.id}>
                          <Table.Td>
                            <Group gap="sm">
                              <ThemeIcon variant="light" color="gray" radius="xl">
                                <IconMail size={16} />
                              </ThemeIcon>
                              <Text fw={500}>{inv.email}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color="gray">
                              {inv.role_name}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge 
                              variant="filled" 
                              color={inv.status === 'PENDING' ? 'yellow' : inv.status === 'ACCEPTED' ? 'green' : 'red'}
                              leftSection={inv.status === 'PENDING' ? <IconClock size={12} /> : null}
                            >
                              {t(`tenantManagement.${inv.status.toLowerCase()}`)}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {new Date(inv.created_at).toLocaleDateString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              {inv.status === 'PENDING' && (
                                <Tooltip label={t('tenantManagement.invitations.resend') || 'Resend Invitation'}>
                                    <ActionIcon 
                                      variant="subtle" 
                                      color="brand" 
                                      onClick={() => handleResendInvitation(inv.id)}
                                      loading={resendingId === inv.id}
                                      aria-label={t('tenantManagement.invitations.resend')}
                                    >
                                      <IconRefresh size={16} />
                                    </ActionIcon>
                                </Tooltip>
                              )}
                              <Tooltip label={t('common.delete')}>
                                <ActionIcon 
                                  variant="subtle" 
                                  color="red"
                                  onClick={() => handleDeleteInvitation(inv)}
                                  loading={deletingId === inv.id}
                                  aria-label={t('tenantManagement.invitations.delete')}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>

      {/* Invite Modal */}
      <Modal 
        opened={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        title={<Text fw={700} size="lg">{t('tenantManagement.inviteCollaborator')}</Text>}
        centered
        radius="lg"
        padding="xl"
      >
        <form onSubmit={inviteForm.onSubmit(handleInvite)}>
          <Stack gap="md">
            <TextInput
              label={t('tenantManagement.email')}
              placeholder="colaborador@institucion.com"
              leftSection={<IconMail size={16} />}
              required
              {...inviteForm.getInputProps('email')}
            />
            <Select
              label={t('tenantManagement.role')}
              placeholder="Selecciona un rol"
              data={roles.map(r => ({ value: r.id, label: r.name }))}
              required
              {...inviteForm.getInputProps('role_id')}
            />
            
            {inviteError && (
              <Alert variant="light" color="red" icon={<IconAlertCircle size={16} />} radius="md">
                {inviteError}
              </Alert>
            )}

            {inviteSuccess && (
              <Alert variant="light" color="green" icon={<IconCheck size={16} />} radius="md">
                {t('tenantManagement.invitationSent')}
              </Alert>
            )}

            <Divider my="sm" />
            
            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={() => setInviteModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={isInviting} leftSection={<IconSend size={16} />}>
                {t('tenantManagement.sendInvitation')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        opened={!!deletingInvitation}
        onClose={() => setDeletingInvitation(null)}
        title={t('tenantManagement.invitations.deleteTitle')}
        radius="md"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            {t('tenantManagement.invitations.deleteConfirm')}
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingInvitation(null)}>
              {t('common.cancel')}
            </Button>
            <Button color="red" onClick={confirmDeleteInvitation} loading={!!deletingId}>
              {t('common.delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
