import type { Meta, StoryObj } from '@storybook/react';
import { Shell } from '../../components/Shell/Shell';
import { SearchFilterBar } from '../../components/SearchFilterBar/SearchFilterBar';
import { DataTable } from '../../components/DataTable/DataTable';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  Title, Text, Stack, Group, Badge, Avatar, Container, Box, rem, Transition, ActionIcon
} from '@mantine/core';
import { 
  IconPlus, IconDownload, IconFilter, IconTrash, IconMail, IconX
} from '@tabler/icons-react';
import { useState } from 'react';

const meta: Meta = {
  title: 'Templates/CRUD Layout',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const MOCK_STUDENTS = [
  { id: '101', name: 'Sebastian Valenzuela', email: 's.valenzuela@vimmit.com', program: 'Ingeniería de Software', status: 'Activo' },
  { id: '102', name: 'Maria Garcia', email: 'm.garcia@academic.edu', program: 'Diseño UX/UI', status: 'Activo' },
  { id: '103', name: 'Lucas Martinez', email: 'l.martinez@gmail.com', program: 'Ciencia de Datos', status: 'Pendiente' },
  { id: '104', name: 'Ana Lopez', email: 'a.lopez@outlook.com', program: 'Inteligencia Artificial', status: 'Pendiente' },
  { id: '105', name: 'Diego Sanchez', email: 'd.sanchez@vimmit.com', program: 'Ingeniería de Software', status: 'Activo' },
];

export const StudentsDirectory: StoryObj = {
  render: () => {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<string | null>('all');
    const [selected, setSelected] = useState<string[]>([]);
    
    const isSelectionMode = selected.length > 0;

    const toggleRow = (id: string) => {
      setSelected(current => 
        current.includes(id) ? current.filter(i => i !== id) : [...current, id]
      );
    };

    const toggleAll = (checked: boolean) => {
      setSelected(checked ? MOCK_STUDENTS.map(r => r.id) : []);
    };

    return (
      <Shell 
        mode="app"
        user={{ name: 'Admin User', role: 'Super Admin' }}
      >
        <Container size="xl" py="xl">
          <Stack gap="xl">
            {/* Header Area */}
            <Group justify="space-between" align="flex-end">
              <Stack gap={4}>
                <Title order={1} fw={800} style={{ letterSpacing: -1 }}>Directorio de Estudiantes</Title>
                <Text c="brand.4">Gestiona la información académica y estados de los estudiantes inscritos.</Text>
              </Stack>
              <Group>
                <Button variant="light" color="secondary" leftSection={<IconDownload size={18} />}>Exportar</Button>
                <Button color="brand" leftSection={<IconPlus size={18} />}>Nuevo Estudiante</Button>
              </Group>
            </Group>

            {/* Content Card */}
            <Card p="xl" radius="xs" withBorder shadow="sm" style={{ overflow: 'visible' }}>
              <Stack gap="xl">
                
                {/* Dynamic Toolbar: Search vs Batch Actions */}
                <Box pos="relative" mih={rem(110)}>
                  <Transition mounted={!isSelectionMode} transition="fade" duration={200}>
                    {(styles) => (
                      <Box style={{ ...styles, position: 'absolute', width: '100%', top: 0, left: 0 }}>
                        <SearchFilterBar
                          searchValue={search}
                          onSearchChange={setSearch}
                          tabsValue={tab}
                          onTabChange={setTab}
                          tabs={[
                            { value: 'all', label: 'Todos', count: MOCK_STUDENTS.length },
                            { value: 'active', label: 'Activos', count: 3 },
                            { value: 'pending', label: 'Pendientes', count: 2 },
                          ]}
                          actions={
                            <Button variant="subtle" color="secondary" leftSection={<IconFilter size={16} />}>Filtros</Button>
                          }
                        />
                      </Box>
                    )}
                  </Transition>

                  <Transition mounted={isSelectionMode} transition="fade" duration={200}>
                    {(styles) => (
                      <Box 
                        style={{ 
                          ...styles, 
                          position: 'absolute', 
                          width: '100%', 
                          height: rem(48), // Selection bar is thinner, so we center it
                          top: rem(20),
                          left: 0,
                          backgroundColor: 'var(--mantine-color-secondary-0)',
                          borderRadius: 'var(--mantine-radius-xs)',
                          border: '1px solid var(--mantine-color-secondary-2)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: `0 ${rem(16)}`,
                          justifyContent: 'space-between',
                          zIndex: 5
                        }}
                      >
                        <Group gap="md">
                          <ActionIcon variant="subtle" color="brand" onClick={() => setSelected([])}>
                            <IconX size={20} />
                          </ActionIcon>
                          <Text fw={700} color="brand">{selected.length} seleccionados</Text>
                        </Group>
                        <Group gap="sm">
                          <Button size="compact-sm" variant="subtle" color="secondary" leftSection={<IconMail size={16} />}>Enviar Correo</Button>
                          <Button size="compact-sm" variant="subtle" color="secondary" leftSection={<IconDownload size={16} />}>Exportar Selección</Button>
                          <Button size="compact-sm" variant="filled" color="error" leftSection={<IconTrash size={16} />}>Eliminar</Button>
                        </Group>
                      </Box>
                    )}
                  </Transition>
                </Box>

                <DataTable>
                  <DataTable.Thead>
                    <DataTable.Tr>
                      <DataTable.SelectionHeader 
                        checked={selected.length === MOCK_STUDENTS.length}
                        indeterminate={selected.length > 0 && selected.length < MOCK_STUDENTS.length}
                        onChange={toggleAll}
                      />
                      <DataTable.Th>Estudiante</DataTable.Th>
                      <DataTable.Th>Programa Académico</DataTable.Th>
                      <DataTable.Th>Estado</DataTable.Th>
                      <DataTable.ActionChevron />
                    </DataTable.Tr>
                  </DataTable.Thead>
                  <DataTable.Tbody>
                    {MOCK_STUDENTS.map(student => (
                      <DataTable.Tr 
                        key={student.id} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => console.log('Go to detail:', student.id)}
                      >
                        <DataTable.SelectionCell 
                          checked={selected.includes(student.id)}
                          onChange={() => toggleRow(student.id)}
                        />
                        <DataTable.Td>
                          <Group gap="sm">
                            <Avatar color="secondary" radius="xs" size="sm" variant="light">
                              {student.name[0]}
                            </Avatar>
                            <Stack gap={0}>
                              <Text size="sm" fw={600}>{student.name}</Text>
                              <Text size="xs" c="brand.4">{student.email}</Text>
                            </Stack>
                          </Group>
                        </DataTable.Td>
                        <DataTable.Td>
                          <Text size="sm">{student.program}</Text>
                        </DataTable.Td>
                        <DataTable.Td>
                          <Badge 
                            variant="dot" 
                            color={student.status === 'Activo' ? 'brand' : 'secondary'}
                            radius="xs"
                          >
                            {student.status}
                          </Badge>
                        </DataTable.Td>
                        <DataTable.ActionChevron />
                      </DataTable.Tr>
                    ))}
                  </DataTable.Tbody>
                </DataTable>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Shell>
    );
  }
};
