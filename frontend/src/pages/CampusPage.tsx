import { Container, Stack, Title, Text, Button, Group, Table, Badge, ActionIcon, Modal, Paper, TextInput, Checkbox, Select } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Can } from '../components/auth/Can';

import { API_BASE_URL } from '../config';

interface Campus {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  tenant_name?: string;
}

function CampusForm({ initialValues, onSuccess, token }: { initialValues?: Campus | null; onSuccess: () => void; token: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const institutionOptions = user?.memberships.map(m => ({ value: m.tenant_id, label: m.tenant_name })) || [];

  const form = useForm({
    initialValues: initialValues || {
      name: '',
      code: '',
      address: '',
      city: '',
      country: '',
      tenant_id: institutionOptions[0]?.value || '',
      is_active: true,
    },
    validate: {
      name: (v) => (v.length < 2 ? t('common.error.tooShort') : null),
      code: (v) => (v.length < 1 ? t('common.error.tooShort') : null),
    },
  });

  const handleSubmit = async (values: any) => {
    const url = `${API_BASE_URL}/api/v1/organization/campuses${initialValues ? `/${initialValues.id}` : ''}`;
    const method = initialValues ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(values),
    });
    onSuccess();
  };

  return (
    <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        {institutionOptions.length > 1 && (
          <Select
            label={t('portal.programsManagement.form.institution')}
            placeholder={t('portal.programsManagement.form.institutionPlaceholder')}
            data={institutionOptions}
            disabled={!!initialValues}
            required
            {...form.getInputProps('tenant_id')}
          />
        )}
        <Group grow>
          <TextInput label={t('portal.campus.form.name')} placeholder={t('portal.campus.form.namePlaceholder')} required {...form.getInputProps('name')} />
          <TextInput label={t('portal.campus.form.code')} placeholder={t('portal.campus.form.codePlaceholder')} required {...form.getInputProps('code')} />
        </Group>
        <TextInput label={t('portal.campus.form.address')} placeholder={t('portal.campus.form.addressPlaceholder')} {...form.getInputProps('address')} />
        <Group grow>
          <TextInput label={t('portal.campus.form.city')} placeholder={t('portal.campus.form.cityPlaceholder')} {...form.getInputProps('city')} />
          <TextInput label={t('portal.campus.form.country')} placeholder={t('portal.campus.form.countryPlaceholder')} {...form.getInputProps('country')} />
        </Group>
        <Checkbox label={t('portal.programsManagement.form.active')} {...form.getInputProps('is_active', { type: 'checkbox' })} />
        <Group justify="flex-end" mt="sm">
          <Button type="submit" color="brand">{t('portal.programsManagement.form.submit')}</Button>
        </Group>
      </Stack>
    </form>
  );
}

export function CampusPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);
  const [deleting, setDeleting] = useState<Campus | null>(null);

  const fetch_ = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/v1/organization/campuses`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) setCampuses(await res.json());
  };

  const deleteCampus = async () => {
    if (!deleting || !token) return;
    await fetch(`${API_BASE_URL}/api/v1/organization/campuses/${deleting.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setDeleting(null);
    fetch_();
  };

  useEffect(() => { fetch_(); }, [token]);

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={4}>
            <Title order={2}>{t('portal.campus.title')}</Title>
            <Text c="dimmed" size="sm">{t('portal.campus.subtitle')}</Text>
          </Stack>
          <Can roles={["Admin"]}>
            <Button leftSection={<IconPlus size={18} />} radius="md" color="brand"
              onClick={() => { setEditing(null); setOpened(true); }}>
              {t('portal.campus.add')}
            </Button>
          </Can>
        </Group>

        {campuses.length > 0 ? (
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('portal.campus.list.name')}</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.institution')}</Table.Th>
                <Table.Th>{t('portal.campus.list.code')}</Table.Th>
                <Table.Th>{t('portal.campus.list.city')}</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.status')}</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {campuses.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td><Text fw={500}>{c.name}</Text></Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color="blue" size="sm">
                      {c.tenant_name}
                    </Badge>
                  </Table.Td>
                  <Table.Td><Badge variant="outline" size="sm" color="gray">{c.code}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{c.city}{c.country ? `, ${c.country}` : ''}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={c.is_active ? 'green' : 'gray'} variant="light">
                      {c.is_active ? t('portal.programsManagement.form.active') : t('portal.inactive')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Can roles={["Admin"]} tenantId={c.tenant_id}>
                        <ActionIcon variant="subtle" color="brand" onClick={() => { setEditing(c); setOpened(true); }}><IconEdit size={16} /></ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => setDeleting(c)}><IconTrash size={16} /></ActionIcon>
                      </Can>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Paper withBorder p="xl" radius="md" ta="center">
            <Text c="dimmed">{t('portal.campus.list.empty')}</Text>
          </Paper>
        )}
      </Stack>

      <Modal opened={opened} onClose={() => setOpened(false)}
        title={editing ? t('portal.campus.edit') : t('portal.campus.create')} radius="md">
        {token && <CampusForm initialValues={editing} onSuccess={() => { setOpened(false); fetch_(); }} token={token} />}
      </Modal>

      <Modal opened={!!deleting} onClose={() => setDeleting(null)}
        title={t('portal.programsManagement.deleteConfirm.title')} radius="md" size="sm">
        <Stack gap="md">
          <Text size="sm">{t('portal.programsManagement.deleteConfirm.message', { name: deleting?.name })}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleting(null)}>{t('common.cancel')}</Button>
            <Button color="red" onClick={deleteCampus}>{t('common.delete')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
