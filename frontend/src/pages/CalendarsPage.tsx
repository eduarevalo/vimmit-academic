import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Group, 
  Table, 
  Badge, 
  ActionIcon, 
  Modal, 
  Paper, 
  TextInput, 
  Select 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

import { useAuth } from '../hooks/useAuth';
import { Can } from '../components/auth/Can';
import { PageHeader } from '../components/common/PageHeader';
import { API_BASE_URL } from '../config';

interface Calendar {
  id: string;
  tenant_id: string;
  program_id: string;
  campus_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  program_name?: string;
  campus_name?: string;
}

interface Program { id: string; name: string; tenant_id: string; }
interface Campus  { id: string; name: string; tenant_id: string; }

function CalendarForm({ initialValues, programs, campuses, onSuccess, token }: {
  initialValues?: Calendar | null;
  programs: Program[];
  campuses: Campus[];
  onSuccess: () => void;
  token: string;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const adminMemberships = user?.memberships.filter(m => m.role_name === 'Admin') || [];

  const form = useForm({
    initialValues: initialValues ? {
      ...initialValues,
      start_date: initialValues.start_date.split('T')[0],
      end_date:   initialValues.end_date.split('T')[0],
    } : {
      name: '',
      program_id: '',
      campus_id: '',
      start_date: null as Date | null,
      end_date: null as Date | null,
      tenant_id: adminMemberships[0]?.tenant_id || '',
      is_active: true,
    },
    validate: {
      name:       (v) => (!v ? t('common.error.tooShort') : null),
      tenant_id:  (v) => (!v ? t('portal.programsManagement.form.institutionRequired') : null),
      program_id: (v) => (!v ? t('common.fieldRequired') : null),
      campus_id:  (v) => (!v ? t('common.fieldRequired') : null),
    },
  });

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      start_date: typeof values.start_date === 'string' ? values.start_date : values.start_date?.toISOString().split('T')[0],
      end_date:   typeof values.end_date === 'string' ? values.end_date : values.end_date?.toISOString().split('T')[0],
    };
    const url = `${API_BASE_URL}/v1/calendar/academic-periods${initialValues ? `/${initialValues.id}` : ''}`;
    const method = initialValues ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    onSuccess();
  };

  const filteredPrograms = programs.filter(p => p.tenant_id === form.values.tenant_id);
  const filteredCampuses = campuses.filter(c => c.tenant_id === form.values.tenant_id);

  useEffect(() => {
    if (!initialValues) {
      if (filteredCampuses.length === 1) {
        form.setFieldValue('campus_id', filteredCampuses[0].id);
      } else if (form.values.campus_id && !filteredCampuses.some(c => c.id === form.values.campus_id)) {
        form.setFieldValue('campus_id', null as any);
      }

      if (filteredPrograms.length === 1) {
        form.setFieldValue('program_id', filteredPrograms[0].id);
      } else if (form.values.program_id && !filteredPrograms.some(p => p.id === form.values.program_id)) {
        form.setFieldValue('program_id', null as any);
      }
    }
  }, [form.values.tenant_id, filteredCampuses.length, filteredPrograms.length]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        {adminMemberships.length > 1 && !initialValues && (
          <Select
            label={t('portal.programsManagement.form.institution')}
            placeholder={t('portal.programsManagement.form.institutionPlaceholder')}
            data={adminMemberships.map(m => ({ value: m.tenant_id, label: m.tenant_name }))}
            required
            {...form.getInputProps('tenant_id')}
            onChange={(value) => {
              form.setFieldValue('tenant_id', value || '');
              form.setFieldValue('program_id', null as any);
              form.setFieldValue('campus_id', null as any);
            }}
          />
        )}
        <TextInput label={t('portal.calendars.form.name')} placeholder={t('portal.calendars.form.namePlaceholder')} required {...form.getInputProps('name')} />
        <Select
          label={t('portal.calendars.form.program')}
          placeholder={t('portal.calendars.form.programPlaceholder')}
          data={filteredPrograms.map(p => ({ value: p.id, label: p.name }))}
          required
          disabled={!!initialValues || !form.values.tenant_id}
          {...form.getInputProps('program_id')}
        />
        <Select
          label={t('portal.calendars.form.campus')}
          placeholder={t('portal.calendars.form.campusPlaceholder')}
          data={filteredCampuses.map(c => ({ value: c.id, label: c.name }))}
          required
          disabled={!!initialValues || !form.values.tenant_id || filteredCampuses.length === 1}
          {...form.getInputProps('campus_id')}
        />
        <Group grow>
          <TextInput type="date" label={t('portal.calendars.form.startDate')} required {...form.getInputProps('start_date')} />
          <TextInput type="date" label={t('portal.calendars.form.endDate')}   required {...form.getInputProps('end_date')} />
        </Group>
        <Group justify="flex-end" mt="sm">
          <Button type="submit" color="brand">{t('portal.calendars.form.submit')}</Button>
        </Group>
      </Stack>
    </form>
  );
}

export function CalendarsPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [programs, setPrograms]   = useState<Program[]>([]);
  const [campuses, setCampuses]   = useState<Campus[]>([]);
  const [opened, setOpened]       = useState(false);
  const [editing, setEditing]     = useState<Calendar | null>(null);
  const [deleting, setDeleting]   = useState<Calendar | null>(null);

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const fetchCalendars = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/v1/calendar/academic-periods`, {
      headers: authHeaders
    });
    if (res.ok) setCalendars(await res.json());
  };

  const fetchLookups = async () => {
    if (!token) return;
    const [progR, campR] = await Promise.all([
      fetch(`${API_BASE_URL}/v1/academic/programs`, { headers: authHeaders }),
      fetch(`${API_BASE_URL}/v1/organization/campuses`, { headers: authHeaders }),
    ]);
    if (progR.ok) setPrograms(await progR.json());
    if (campR.ok) setCampuses(await campR.json());
  };

  const deleteCalendar = async () => {
    if (!deleting || !token) return;
    await fetch(`${API_BASE_URL}/v1/calendar/academic-periods/${deleting.id}`, {
      method: 'DELETE', headers: authHeaders,
    });
    setDeleting(null);
    fetchCalendars();
  };

  useEffect(() => { fetchCalendars(); }, [token]);

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={t('portal.calendars.title')}
          subtitle={t('portal.calendars.subtitle')}
          actions={
            <Can roles={["Admin"]}>
              <Button leftSection={<IconPlus size={18} />} radius="md" color="brand"
                onClick={() => {
                  setEditing(null);
                  fetchLookups();
                  setOpened(true);
                }}>
                {t('portal.calendars.create')}
              </Button>
            </Can>
          }
        />

        {calendars.length > 0 ? (
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('portal.calendars.list.name')}</Table.Th>
                <Table.Th>{t('portal.calendars.list.program')}</Table.Th>
                <Table.Th>{t('portal.calendars.list.campus')}</Table.Th>
                <Table.Th>{t('portal.calendars.list.period')}</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.status')}</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {calendars.map((cal) => (
                <Table.Tr key={cal.id}>
                  <Table.Td><Text fw={500}>{cal.name}</Text></Table.Td>
                  <Table.Td><Text size="sm">{cal.program_name || '—'}</Text></Table.Td>
                  <Table.Td><Text size="sm">{cal.campus_name || '—'}</Text></Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(cal.start_date).toLocaleDateString()} – {new Date(cal.end_date).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={cal.is_active ? 'green' : 'gray'} variant="light">
                      {cal.is_active ? t('portal.programsManagement.form.active') : t('portal.inactive')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Can roles={["Admin"]} tenantId={cal.tenant_id}>
                        <ActionIcon variant="subtle" color="brand" onClick={() => {
                          setEditing(cal);
                          fetchLookups();
                          setOpened(true);
                        }}><IconEdit size={16} /></ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => setDeleting(cal)}><IconTrash size={16} /></ActionIcon>
                      </Can>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Paper withBorder p="xl" radius="md" ta="center">
            <Text c="dimmed">{t('portal.calendars.list.empty')}</Text>
          </Paper>
        )}
      </Stack>

      <Modal opened={opened} onClose={() => setOpened(false)}
        title={editing ? t('portal.calendars.edit') : t('portal.calendars.create')} radius="md" size="lg">
        {token && (
          <CalendarForm
            initialValues={editing}
            programs={programs}
            campuses={campuses}
            onSuccess={() => { setOpened(false); fetchCalendars(); }}
            token={token}
          />
        )}
      </Modal>

      <Modal opened={!!deleting} onClose={() => setDeleting(null)}
        title={t('portal.programsManagement.deleteConfirm.title')} radius="md" size="sm">
        <Stack gap="md">
          <Text size="sm">{t('portal.programsManagement.deleteConfirm.message', { name: deleting?.name })}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleting(null)}>{t('common.cancel')}</Button>
            <Button color="red" onClick={deleteCalendar}>{t('common.delete')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}


