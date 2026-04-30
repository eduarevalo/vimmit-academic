import type { Meta, StoryObj } from '@storybook/react';
import { Shell } from '../../components/Shell/Shell';
import { DataTable } from '../../components/DataTable/DataTable';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { SearchFilterBar } from '../../components/SearchFilterBar/SearchFilterBar';
import { 
  Title, Text, Stack, Group, Badge, Avatar, Container, Box, rem, 
  NumberInput, TextInput, ActionIcon, Tooltip, Breadcrumbs, Anchor, 
  Paper, Divider, ThemeIcon
} from '@mantine/core';
import { 
  IconCheck, IconCloudUpload, IconFileDescription, IconMessageDots, 
  IconHistory, IconDownload, IconAlertCircle, IconArrowLeft 
} from '@tabler/icons-react';
import { useState } from 'react';

const meta: Meta = {
  title: 'Templates/Activity Grading',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const MOCK_ACTIVITY = {
  id: 'act-101',
  title: 'Taller 2: Maquetación con React y Mantine',
  course: 'Desarrollo Web Fullstack',
  period: '2024-2',
  weight: '20%',
  dueDate: '20 Oct 2024, 23:59',
  status: 'In Progress',
  totalStudents: 12,
  gradedCount: 4
};

const MOCK_GRADES = [
  { id: '1', name: 'Sebastian Valenzuela', avatar: 'brand.5', submissionDate: '19 Oct, 14:20', status: 'Submitted', grade: 4.5, comment: 'Excelente trabajo con la responsividad.' },
  { id: '2', name: 'Maria Garcia', avatar: 'secondary.5', submissionDate: '20 Oct, 09:15', status: 'Submitted', grade: null, comment: '' },
  { id: '3', name: 'Lucas Martinez', avatar: 'brand.6', submissionDate: '21 Oct, 00:05', status: 'Late', grade: null, comment: '' },
  { id: '4', name: 'Ana Lopez', avatar: 'brand.4', submissionDate: null, status: 'No Submission', grade: null, comment: '' },
  { id: '5', name: 'Diego Sanchez', avatar: 'secondary.4', submissionDate: '18 Oct, 22:30', status: 'Submitted', grade: 5.0, comment: 'Perfecto.' },
  { id: '6', name: 'Camila Torres', avatar: 'brand.3', submissionDate: '19 Oct, 18:45', status: 'Submitted', grade: null, comment: '' },
  { id: '7', name: 'Julian Rivas', avatar: 'secondary.3', submissionDate: '20 Oct, 23:00', status: 'Submitted', grade: null, comment: '' },
  { id: '8', name: 'Elena Mendez', avatar: 'error.6', submissionDate: null, status: 'No Submission', grade: null, comment: '' },
];

export const DesktopGrading: StoryObj = {
  render: () => {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<string | null>('all');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1500);
    };

    const breadcrumbs = [
      { title: 'Académico', href: '#' },
      { title: 'Mis Cursos', href: '#' },
      { title: 'Desarrollo Web Fullstack', href: '#' },
      { title: 'Calificaciones', href: '#' },
    ].map((item, index) => (
      <Anchor href={item.href} key={index} size="sm" c="dimmed">
        {item.title}
      </Anchor>
    ));

    return (
      <Shell 
        mode="app"
        user={{ name: 'Prof. Andres Garcia', role: 'Docente Titular' }}
      >
        <Container size="xl" py="xl" pb={100}>
          <Stack gap="xl">
            {/* Context Navigation */}
            <Group justify="space-between">
              <Stack gap="xs">
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
                <Group gap="sm">
                  <ActionIcon variant="subtle" color="brand" size="lg">
                    <IconArrowLeft size={20} />
                  </ActionIcon>
                  <Title order={1} fw={800} style={{ letterSpacing: -1 }}>Calificar Actividad</Title>
                </Group>
              </Stack>
              <Group>
                <Button variant="light" color="brand">Guardar Progreso</Button>
                <Button color="brand">Publicar Notas</Button>
              </Group>
            </Group>

            {/* Activity Summary Info */}
            <Card p={0} withBorder shadow="sm" style={{ overflow: 'hidden' }}>
              <Group wrap="nowrap" gap={0} align="stretch">
                <Box bg="brand.6" p="xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ThemeIcon size={64} variant="white" color="brand">
                    <IconFileDescription size={32} />
                  </ThemeIcon>
                </Box>
                <Stack p="xl" gap="md" style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Text c="brand.7" fw={700} size="xs" tt="uppercase">Actividad Evaluativa</Text>
                      <Title order={3}>{MOCK_ACTIVITY.title}</Title>
                      <Text size="sm" c="brand.3">{MOCK_ACTIVITY.course} • Grupo A</Text>
                    </Stack>
                    <Paper withBorder p="xs" bg="secondary.0">
                      <Stack gap={0} align="center">
                        <Text size="xl" fw={900} c="brand.8">{MOCK_ACTIVITY.weight}</Text>
                        <Text size="xs" c="brand.4" tt="uppercase" ls={1}>Peso Final</Text>
                      </Stack>
                    </Paper>
                  </Group>
                  
                  <Divider variant="dashed" color="brand.2" />
                  
                  <Group gap="xl">
                    <Group gap="xs">
                      <IconAlertCircle size={16} color="var(--mantine-color-brand-6)" />
                      <Text size="sm"><Text component="span" fw={700}>Límite:</Text> {MOCK_ACTIVITY.dueDate}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={16} color="var(--mantine-color-brand-6)" />
                      <Text size="sm"><Text component="span" fw={700}>Calificados:</Text> {MOCK_ACTIVITY.gradedCount} / {MOCK_ACTIVITY.totalStudents}</Text>
                    </Group>
                  </Group>
                </Stack>
              </Group>
            </Card>

            {/* Students List Card */}
            <Card p="xl" withBorder shadow="sm" style={{ overflow: 'visible' }}>
              <Stack gap="xl">
                <SearchFilterBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  tabsValue={tab}
                  onTabChange={setTab}
                  tabs={[
                    { value: 'all', label: 'Todos los Estudiantes', count: 8 },
                    { value: 'pending', label: 'Pendientes por Nota', count: 6 },
                    { value: 'no-submission', label: 'Sin Entrega', count: 2 },
                  ]}
                  actions={
                    <Button variant="light" color="secondary" leftSection={<IconDownload size={16} />}>
                      Listado
                    </Button>
                  }
                />

                <DataTable>
                  <DataTable.Thead>
                    <DataTable.Tr>
                      <DataTable.Th>Estudiante</DataTable.Th>
                      <DataTable.Th>Entrega</DataTable.Th>
                      <DataTable.Th w={120}>Calificación</DataTable.Th>
                      <DataTable.Th>Retroalimentación</DataTable.Th>
                      <DataTable.Th w={100}>Estado</DataTable.Th>
                    </DataTable.Tr>
                  </DataTable.Thead>
                  <DataTable.Tbody>
                    {MOCK_GRADES.map(row => (
                      <DataTable.Tr key={row.id}>
                        <DataTable.Td>
                          <Group gap="sm">
                            <Avatar color={row.avatar} radius="xs" size="sm">
                              {row.name[0]}
                            </Avatar>
                            <Stack gap={0}>
                              <Text size="sm" fw={600}>{row.name}</Text>
                              <Text size="xs" c="brand.4">ID: 2024{row.id}00</Text>
                            </Stack>
                          </Group>
                        </DataTable.Td>
                        <DataTable.Td>
                          {row.submissionDate ? (
                            <Group gap={6}>
                              <IconCloudUpload size={14} color="var(--mantine-color-brand-6)" />
                              <Stack gap={0}>
                                <Anchor size="xs" fw={700} c="brand.7">ver_entrega.zip</Anchor>
                                <Text size="10px" c="dimmed">{row.submissionDate}</Text>
                              </Stack>
                            </Group>
                          ) : (
                            <Text size="xs" c="red" fw={700}>Sin entrega</Text>
                          )}
                        </DataTable.Td>
                        <DataTable.Td>
                          <NumberInput 
                            min={0} 
                            max={5} 
                            decimalScale={1} 
                            step={0.1}
                            placeholder="0.0"
                            defaultValue={row.grade || undefined}
                            size="sm"
                            styles={{ input: { fontWeight: 700, textAlign: 'center' }}}
                          />
                        </DataTable.Td>
                        <DataTable.Td>
                          <TextInput 
                            placeholder="Agregar comentario..."
                            defaultValue={row.comment}
                            size="sm"
                            leftSection={<IconMessageDots size={14} color="var(--mantine-color-brand-3)" />}
                          />
                        </DataTable.Td>
                        <DataTable.Td>
                          <Badge 
                            variant="dot" 
                            color={row.grade ? 'brand.6' : 'secondary.4'}
                            size="sm"
                          >
                            {row.grade ? 'Calificado' : 'Pendiente'}
                          </Badge>
                        </DataTable.Td>
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

