import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Stack, 
  Table, 
  Group, 
  Text, 
  Button, 
  ActionIcon, 
  NumberFormatter, 
  Badge, 
  Modal, 
  TextInput, 
  NumberInput,
  Paper
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config';

interface ProgramCostItem {
  id: string;
  name: string;
  description?: string;
  amount: number;
  is_recurring: boolean;
  is_active: boolean;
  effective_from: string;
}

export function ProgramCostsList({ programId, tenantId }: { programId: string, tenantId: string }) {
  const { t } = useTranslation();
  const { token } = useAuth();
  
  const [costs, setCosts] = useState<ProgramCostItem[]>([]);
  const [opened, setOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      amount: 0,
    },
    validate: {
      name: (v) => (v.length < 2 ? t('common.error.tooShort') : null),
      amount: (v) => (v <= 0 ? t('common.error.invalid') : null),
    },
  });

  const fetchCosts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/financial/costs?program_id=${programId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        }
      });
      if (res.ok) setCosts(await res.json());
    } catch (e) {
      console.error('Error fetching costs:', e);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [programId, token]);

  const handleCreate = async (values: typeof form.values) => {
    if (!token) return;
    try {
      const payload = {
        program_id: programId,
        name: values.name,
        amount: values.amount,
        is_recurring: false,
        effective_from: new Date().toISOString().split('T')[0] // local today
      };

      const res = await fetch(`${API_BASE_URL}/v1/financial/costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setOpened(false);
        form.reset();
        fetchCosts();
      } else {
         const err = await res.json();
         alert(JSON.stringify(err, null, 2));
      }
    } catch (e) {
      console.error('Error creating cost:', e);
    }
  };

  const handleDelete = async (costId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/financial/costs/${costId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        }
      });
      if (res.ok) {
        setIsDeleting(null);
        fetchCosts();
      }
    } catch (e) {
      console.error('Error deleting cost:', e);
    }
  };

  const rows = costs.map((cost) => (
    <Table.Tr key={cost.id}>
      <Table.Td>
        <Text fw={500}>{cost.name}</Text>
        {cost.description && <Text size="xs" c="dimmed">{cost.description}</Text>}
      </Table.Td>
      <Table.Td>
        <Text fw={700} c="brand">
          <NumberFormatter prefix="$" value={cost.amount} thousandSeparator /> COP
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={cost.is_active ? 'green' : 'gray'} variant="light">
          {cost.is_active ? t('common.active') : t('common.inactive')}
        </Badge>
      </Table.Td>
      <Table.Td>
        <ActionIcon variant="subtle" color="red" onClick={() => setIsDeleting(cost.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md" mt="md">
      <Group justify="space-between" align="center">
        <Text fw={600} size="lg">{t('portal.programsManagement.costs.title', 'Costos del Programa')}</Text>
        <Button size="xs" variant="light" leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
          {t('portal.programsManagement.costs.add', 'Agregar Costo')}
        </Button>
      </Group>

      {costs.length > 0 ? (
         <Table verticalSpacing="sm" highlightOnHover>
           <Table.Thead>
             <Table.Tr>
               <Table.Th>{t('portal.programsManagement.list.name', 'Nombre')}</Table.Th>
               <Table.Th>{t('portal.programsManagement.costs.amount', 'Monto')}</Table.Th>
               <Table.Th>{t('portal.programsManagement.list.status', 'Estado')}</Table.Th>
               <Table.Th></Table.Th>
             </Table.Tr>
           </Table.Thead>
           <Table.Tbody>{rows}</Table.Tbody>
         </Table>
      ) : (
         <Paper withBorder p="xl" radius="xs" ta="center">
            <Text c="dimmed">{t('portal.programsManagement.costs.empty', 'No se han definido costos fijos para este programa.')}</Text>
         </Paper>
      )}

      {/* Creation Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('portal.programsManagement.costs.add', 'Agregar Costo')} radius="xs">
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack gap="md">
            <TextInput
              label={t('portal.programsManagement.list.name')}
              placeholder="Ej. Matrícula, Uniforme, Carnet"
              required
              {...form.getInputProps('name')}
            />
            <NumberInput
              label={t('portal.programsManagement.costs.amount', 'Monto')}
              description="Valor en pesos colombianos (COP)"
              prefix="$"
              thousandSeparator
              required
              min={0}
              {...form.getInputProps('amount')}
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit" color="brand">{t('common.save', 'Guardar')}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Deletion Modal */}
      <Modal opened={!!isDeleting} onClose={() => setIsDeleting(null)} title={t('common.confirm', 'Confirmar')} size="sm" radius="xs">
        <Stack gap="md">
          <Text size="sm">{t('portal.programsManagement.costs.deleteConfirm', '¿Deseas inactivar o eliminar este costo?')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsDeleting(null)}>{t('common.cancel', 'Cancelar')}</Button>
            <Button color="red" onClick={() => isDeleting && handleDelete(isDeleting)}>{t('common.delete', 'Eliminar')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
