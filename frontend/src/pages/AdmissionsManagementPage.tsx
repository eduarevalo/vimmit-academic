import { useState, useEffect } from 'react';
import { 
  Table, Text, Badge, Group, ActionIcon, 
  Menu, Stack, Card, TextInput, Select,
  Button, ScrollArea, LoadingOverlay,
  Box,
  Container,
  Alert
} from '@mantine/core';
import { 
  IconDots, IconEye, IconCheck, 
  IconRefresh, IconSearch, IconFilter,
  IconClock, IconCircleCheck, IconCircleX,
  IconUserCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';

interface AdmissionApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  program_name?: string;
  campus_name?: string;
  calendar_name?: string;
  status: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'REJECTED' | 'ENROLLED';
  created_at: string;
}

export function AdmissionsManagementPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [enrollAlert, setEnrollAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/administrative/admissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/administrative/admissions/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Update failed');
      
      fetchApplications();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleEnroll = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/administrative/admissions/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Enrollment failed');
      }
      
      setEnrollAlert({
        type: 'success',
        message: t('portal.admissions.list.enrollSuccess')
      });
      
      fetchApplications();
    } catch (error: any) {
      setEnrollAlert({
        type: 'error',
        message: error.message || 'Error processing enrollment'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          app.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const label = t(`portal.admissions.status.${status}`) || status;
    switch (status) {
      case 'PENDING': return <Badge color="gray" variant="light" leftSection={<IconClock size={12} />}>{label}</Badge>;
      case 'VERIFYING': return <Badge color="blue" variant="light" leftSection={<IconRefresh size={12} />}>{label}</Badge>;
      case 'VERIFIED': return <Badge color="green" variant="light" leftSection={<IconCircleCheck size={12} />}>{label}</Badge>;
      case 'REJECTED': return <Badge color="red" variant="light" leftSection={<IconCircleX size={12} />}>{label}</Badge>;
      case 'ENROLLED': return <Badge color="teal" variant="filled" leftSection={<IconCheck size={12} />}>{label}</Badge>;
      default: return <Badge color="gray">{label}</Badge>;
    }
  };

  return (
    <Container size="lg" py={40}>
      <Stack gap="lg">
        <PageHeader 
          title={t('portal.admissions.title')} 
          subtitle={t('portal.admissions.subtitle')}
        />

        <Card withBorder radius="xs" p="md">
          <Group justify="space-between" mb="lg">
            <Group style={{ flex: 1 }}>
              <TextInput 
                placeholder={t('common.search')} 
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1, maxWidth: 400 }}
              />
              <Select 
                placeholder="Filtrar por estado"
                data={[
                  { value: 'PENDING', label: 'Pendiente' },
                  { value: 'VERIFYING', label: 'Verificando' },
                  { value: 'VERIFIED', label: 'Verificado' },
                  { value: 'REJECTED', label: 'Rechazado' },
                  { value: 'ENROLLED', label: 'Matriculado' }
                ]}
                leftSection={<IconFilter size={16} />}
                clearable
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </Group>
            <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={fetchApplications}>
              {t('common.refresh')}
            </Button>
          </Group>

          {enrollAlert && (
            <Alert 
              variant="light" 
              color={enrollAlert.type === 'success' ? 'green' : 'red'} 
              title={enrollAlert.type === 'success' ? t('common.success') : t('common.error.title')}
              icon={<IconAlertCircle size={16} />}
              withCloseButton
              onClose={() => setEnrollAlert(null)}
              mb="md"
            >
              {enrollAlert.message}
            </Alert>
          )}

          <ScrollArea>
            <Box pos="relative">
              <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} />
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('portal.admissions.list.applicant')}</Table.Th>
                    <Table.Th>{t('portal.admissions.list.program')}</Table.Th>
                    <Table.Th>{t('portal.admissions.list.status')}</Table.Th>
                    <Table.Th>{t('portal.admissions.list.date')}</Table.Th>
                    <Table.Th style={{ width: 80 }}>{t('portal.admissions.list.actions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredApps.map((app) => (
                    <Table.Tr key={app.id}>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>{app.full_name}</Text>
                          <Text size="xs" c="dimmed">{app.email}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{app.program_name || 'Programa no especificado'}</Text>
                      </Table.Td>
                      <Table.Td>{getStatusBadge(app.status)}</Table.Td>
                      <Table.Td>
                        <Text size="xs">{new Date(app.created_at).toLocaleDateString()}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Menu position="bottom-end" withArrow>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => navigate(`/portal/administrative/admissions/${app.id}`)}>
                              {t('portal.admissions.list.viewDetails')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Label>{t('portal.admissions.list.changeStatus')}</Menu.Label>
                            <Menu.Item leftSection={<IconRefresh size={14} />} color="blue" onClick={() => updateStatus(app.id, 'VERIFYING')}>
                              {t('portal.admissions.status.VERIFYING')}
                            </Menu.Item>
                            <Menu.Item leftSection={<IconCircleCheck size={14} />} color="green" onClick={() => updateStatus(app.id, 'VERIFIED')}>
                              {t('portal.admissions.status.VERIFIED')}
                            </Menu.Item>
                            <Menu.Item leftSection={<IconCircleX size={14} />} color="red" onClick={() => updateStatus(app.id, 'REJECTED')}>
                              {t('portal.admissions.status.REJECTED')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<IconUserCheck size={14} />} 
                              color="brand" 
                              onClick={() => handleEnroll(app.id)}
                              disabled={app.status === 'ENROLLED'}
                            >
                              {t('portal.admissions.list.enroll')}
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {filteredApps.length === 0 && !loading && (
                    <Table.Tr>
                      <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                        <Text c="dimmed">{t('portal.admissions.list.empty')}</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          </ScrollArea>
        </Card>
      </Stack>
    </Container>
  );
}
