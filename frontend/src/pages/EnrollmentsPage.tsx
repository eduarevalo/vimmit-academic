import { useState, useEffect } from 'react';
import { 
  Table, Text, Badge, Group, Stack, Card, 
  TextInput, Select, Button, ScrollArea, LoadingOverlay,
  Box, Container
} from '@mantine/core';
import { 
  IconRefresh, IconSearch, IconFilter,
  IconSchool, IconAward
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';

interface Enrollment {
  id: string;
  student_id: string;
  student_name: string;
  program_name: string;
  level_name: string;
  calendar_name: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'GRADUATED';
  enrolled_at: string;
}

interface Calendar {
  id: string;
  name: string;
}

export function EnrollmentsPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [calendarFilter, setCalendarFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/v1/administrative/enrollments`);
      if (calendarFilter) url.searchParams.append('calendar_id', calendarFilter);
      if (statusFilter) url.searchParams.append('status', statusFilter);
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'all' // Explicitly fetch all authorized or replace with a selector in the future
        }
      });
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendars = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/calendar/academic-periods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'all'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch calendars');
      const data = await response.json();
      setCalendars(data);
    } catch (error) {
      console.error('Fetch calendars error:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCalendars();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEnrollments();
    }
  }, [token, calendarFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'gray',
      CONFIRMED: 'green',
      CANCELLED: 'red',
      GRADUATED: 'blue'
    };
    return (
      <Badge color={colors[status] || 'gray'} variant="light">
        {t(`portal.enrollments.status.${status}`) || status}
      </Badge>
    );
  };

  const filteredEnrollments = enrollments.filter(e => {
    const studentMatch = e.student_name?.toLowerCase().includes(search.toLowerCase());
    const programMatch = e.program_name?.toLowerCase().includes(search.toLowerCase());
    return studentMatch || programMatch;
  });

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={t('portal.enrollments.title')}
          subtitle={t('portal.enrollments.subtitle')}
        />

        <Card withBorder radius="xs" p="md">
          <Group justify="space-between" mb="md">
            <Group style={{ flex: 1 }}>
              <TextInput 
                placeholder={t('common.search')}
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1, maxWidth: 400 }}
              />
              <Select 
                placeholder={t('portal.enrollments.list.period')}
                data={calendars.map(c => ({ value: c.id, label: c.name }))}
                leftSection={<IconFilter size={16} />}
                clearable
                value={calendarFilter}
                onChange={setCalendarFilter}
                style={{ width: 250 }}
              />
              <Select 
                placeholder={t('portal.enrollments.list.status')}
                data={[
                  { value: 'PENDING', label: t('portal.enrollments.status.PENDING') || 'Pendiente' },
                  { value: 'CONFIRMED', label: t('portal.enrollments.status.CONFIRMED') || 'Confirmada' },
                  { value: 'CANCELLED', label: t('portal.enrollments.status.CANCELLED') || 'Cancelada' },
                  { value: 'GRADUATED', label: t('portal.enrollments.status.GRADUATED') || 'Graduado' }
                ]}
                leftSection={<IconFilter size={16} />}
                clearable
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
              />
            </Group>
            <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={fetchEnrollments}>
              {t('common.refresh')}
            </Button>
          </Group>

          <ScrollArea>
            <Box pos="relative">
              <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} />
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('portal.enrollments.list.student')}</Table.Th>
                    <Table.Th>{t('portal.enrollments.list.program')}</Table.Th>
                    <Table.Th>{t('portal.enrollments.list.level')}</Table.Th>
                    <Table.Th>{t('portal.enrollments.list.period')}</Table.Th>
                    <Table.Th>{t('portal.enrollments.list.status')}</Table.Th>
                    <Table.Th>{t('portal.enrollments.list.date')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredEnrollments.map((e) => (
                    <Table.Tr key={e.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <IconSchool size={16} color="gray" />
                          <Text size="sm" fw={500}>{e.student_name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{e.program_name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          <IconAward size={14} color="blue" />
                          <Text size="sm">{e.level_name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{e.calendar_name}</Text>
                      </Table.Td>
                      <Table.Td>{getStatusBadge(e.status)}</Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {new Date(e.enrolled_at).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {filteredEnrollments.length === 0 && !loading && (
                    <Table.Tr>
                      <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <Text c="dimmed">{t('portal.enrollments.list.empty')}</Text>
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
