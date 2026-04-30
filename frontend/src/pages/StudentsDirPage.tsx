import { useState, useEffect } from 'react';
import { 
  Text, Badge, Group, Stack, Card, 
  Button, Container, ActionIcon, Tooltip, Avatar,
} from '@mantine/core';
import { 
  IconRefresh, IconEye, IconUserPlus
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { DataTable, SearchFilterBar } from '@ux';

interface StudentSummary {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  programs: string[];
  institutions: string[];
}

export function StudentsDirPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<string | null>('all');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/administrative/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
    const query = search.toLowerCase();
    
    // Tab filtering logic
    if (tabFilter === 'enrolled' && (s.programs || []).length === 0) return false;
    if (tabFilter === 'leads' && (s.programs || []).length > 0) return false;

    const programsMatch = (s.programs || []).some(p => p.toLowerCase().includes(query));
    const institutionsMatch = (s.institutions || []).some(i => i.toLowerCase().includes(query));
    
    return fullName.includes(query) || 
           s.email.toLowerCase().includes(query) || 
           programsMatch || 
           institutionsMatch;
  });

  const enrolledCount = students.filter(s => (s.programs || []).length > 0).length;
  const leadsCount = students.filter(s => (s.programs || []).length === 0).length;

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={t('portal.students.title', 'Students Hub')}
          subtitle={t('portal.students.subtitle', 'Directory and active status of all enrolled students')}
          actions={
            <Button color="brand" leftSection={<IconUserPlus size={18} />} radius="xs">
              {t('portal.students.add', 'New Student')}
            </Button>
          }
        />

        <Card withBorder radius="xs" p="md">
          <Stack gap="md">
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              tabsValue={tabFilter}
              onTabChange={setTabFilter}
              tabs={[
                { value: 'all', label: 'Todos', count: students.length },
                { value: 'enrolled', label: 'Con Matrícula', count: enrolledCount },
                { value: 'leads', label: 'Sin Matrícula', count: leadsCount },
              ]}
              actions={
                <Button variant="light" color="gray" leftSection={<IconRefresh size={16} />} onClick={fetchStudents} radius="xs">
                  {t('common.refresh', 'Refresh')}
                </Button>
              }
            />

            <DataTable 
              loading={loading} 
              empty={filteredStudents.length === 0}
              emptyMessage={t('portal.students.list.empty', 'No students match your filters')}
            >
              <DataTable.Thead>
                <DataTable.Tr>
                  <DataTable.Th>{t('portal.students.list.name', 'Name')}</DataTable.Th>
                  <DataTable.Th>{t('portal.students.list.contact', 'Contact')}</DataTable.Th>
                  <DataTable.Th>{t('portal.students.list.academic', 'Programs')}</DataTable.Th>
                  <DataTable.Th>{t('portal.students.list.institution', 'Institutions')}</DataTable.Th>
                  <DataTable.Th style={{ textAlign: 'right' }}>{t('common.actions', 'Actions')}</DataTable.Th>
                </DataTable.Tr>
              </DataTable.Thead>
              <DataTable.Tbody>
                {filteredStudents.map((s) => (
                  <DataTable.Tr key={s.id}>
                    <DataTable.Td>
                      <Group gap="sm">
                        <Avatar 
                          radius="xs" 
                          color="brand" 
                          variant="light"
                          size="md"
                        >
                          {(s.first_name?.[0] || '') + (s.last_name?.[0] || '')}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={600}>
                            {s.first_name} {s.last_name}
                          </Text>
                          <Text size="xs" c="dimmed">ID: {s.id.slice(0, 8)}</Text>
                        </Stack>
                      </Group>
                    </DataTable.Td>
                    <DataTable.Td>
                      <Text size="sm">{s.email}</Text>
                      <Text size="xs" c="dimmed">{s.phone || '-'}</Text>
                    </DataTable.Td>
                    <DataTable.Td>
                      <Group gap={4}>
                        {(s.programs || []).map((p, idx) => (
                          <Badge key={idx} variant="dot" size="sm" radius="xs" color="brand">
                            {p}
                          </Badge>
                        ))}
                        {(s.programs || []).length === 0 && (
                           <Text size="xs" c="dimmed italic">{t('portal.students.list.noPrograms', 'Prospect')}</Text>
                        )}
                      </Group>
                    </DataTable.Td>
                    <DataTable.Td>
                      <Group gap={4}>
                        {(s.institutions || []).map((i, idx) => (
                          <Badge key={idx} color="indigo" variant="light" size="sm" radius="xs">
                            {i}
                          </Badge>
                        ))}
                      </Group>
                    </DataTable.Td>
                    <DataTable.Td style={{ textAlign: 'right' }}>
                      <Tooltip label={t('portal.students.actions.viewProfile', 'View Profile')}>
                        <ActionIcon 
                          variant="subtle" 
                          color="brand"
                          onClick={() => navigate(`/portal/students/${s.id}`)}
                          size="lg"
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </DataTable.Td>
                  </DataTable.Tr>
                ))}
              </DataTable.Tbody>
            </DataTable>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
