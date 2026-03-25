import { Container, Stack, Title, Text, Button, Group, Table, Badge, ActionIcon, Modal, Paper } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ProgramForm } from '../components/portal/ProgramForm';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = 'http://localhost:8000';

interface Program {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  name: string;
  description: string;
  duration: string;
  is_active: boolean;
}

export function ProgramsPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [opened, setOpened] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const fetchPrograms = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/academic/programs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [ token]);

  const rows = programs.map((program) => (
    <Table.Tr key={program.id}>
      <Table.Td>
        <Text fw={500}>{program.name}</Text>
        <Text size="xs" c="dimmed" lineClamp={1}>{program.description}</Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="outline" color="blue" size="sm">
          {program.tenant_name}
        </Badge>
      </Table.Td>
      <Table.Td>{program.duration}</Table.Td>
      <Table.Td>
        <Badge color={program.is_active ? 'green' : 'gray'} variant="light">
          {program.is_active ? t('portal.programsManagement.form.active') : 'Inactivo'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" color="brand" onClick={() => {
            setEditingProgram(program);
            setOpened(true);
          }}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={4}>
            <Title order={2}>{t('portal.programsManagement.title')}</Title>
            <Text c="dimmed" size="sm">{t('portal.programsManagement.subtitle')}</Text>
          </Stack>
          <Button leftSection={<IconPlus size={18} />} radius="md" color="brand" onClick={() => {
             setEditingProgram(null);
             setOpened(true);
          }}>
            {t('portal.programsManagement.create')}
          </Button>
        </Group>

        {programs.length > 0 ? (
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('portal.programsManagement.list.name')}</Table.Th>
                <Table.Th>Institución</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.duration')}</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.status')}</Table.Th>
                <Table.Th>{t('portal.programsManagement.list.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : (
          <Paper withBorder p="xl" radius="md" ta="center">
             <Text c="dimmed">{t('portal.programsManagement.list.empty')}</Text>
          </Paper>
        )}
      </Stack>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title={editingProgram ? t('portal.programsManagement.edit') : t('portal.programsManagement.create')}
        radius="md"
      >
        <ProgramForm 
          initialValues={editingProgram} 
          onSuccess={() => {
            setOpened(false);
            fetchPrograms();
          }} 
        />
      </Modal>
    </Container>
  );
}
