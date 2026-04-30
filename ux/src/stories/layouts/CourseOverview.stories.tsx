import type { Meta, StoryObj } from '@storybook/react';
import { Shell } from '../../components/Shell/Shell';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  Title, Text, Stack, Group, Badge, Avatar, Container, Box, rem, 
  Progress, Accordion, ThemeIcon, Divider, Paper, Grid
} from '@mantine/core';
import { 
  IconBook, IconFileText, IconPencil, IconFlask, IconCertificate,
  IconChartBar, IconCalendar, IconUser, IconChevronRight
} from '@tabler/icons-react';

const meta: Meta = {
  title: 'Templates/Course Overview',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const MOCK_COURSE = {
  title: 'Desarrollo Web Fullstack con React',
  code: 'DW-402',
  teacher: 'Andres Garcia',
  period: '2024-2',
  progress: 65,
  totalWeight: 100,
  gradedWeight: 45
};

const UNITS = [
  {
    id: 'u1',
    title: 'Unidad 1: Fundamentos de Frontend',
    weight: 30,
    activities: [
      { id: 'a1', title: 'Taller: HTML5 Semántico y SEO', type: 'Taller', weight: 10, status: 'Graded', grade: 4.8 },
      { id: 'a2', title: 'Laboratorio: CSS Grid y Flexbox', type: 'Laboratorio', weight: 10, status: 'Graded', grade: 4.2 },
      { id: 'a3', title: 'Quiz 1: Selectores y Cascada', type: 'Evaluación', weight: 10, status: 'Graded', grade: 3.8 },
    ]
  },
  {
    id: 'u2',
    title: 'Unidad 2: React Core y State Management',
    weight: 40,
    activities: [
      { id: 'a4', title: 'Maquetación con Componentes', type: 'Proyecto', weight: 15, status: 'Graded', grade: 4.5 },
      { id: 'a5', title: 'Uso de Hooks y Efectos', type: 'Taller', weight: 15, status: 'Submitted', grade: null },
      { id: 'a6', title: 'Context API vs Redux', type: 'Laboratorio', weight: 10, status: 'Pending', grade: null },
    ]
  },
  {
    id: 'u3',
    title: 'Unidad 3: Backend e Integración',
    weight: 30,
    activities: [
      { id: 'a7', title: 'API REST con Node.js', type: 'Laboratorio', weight: 15, status: 'Closed', grade: null },
      { id: 'a8', title: 'Proyecto Final: E-commerce', type: 'Proyecto', weight: 15, status: 'Open', grade: null },
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Graded': return 'brand.6';
    case 'Submitted': return 'indigo';
    case 'Open': return 'green';
    case 'Closed': return 'gray';
    default: return 'gray';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Taller': return <IconPencil size={16} />;
    case 'Laboratorio': return <IconFlask size={16} />;
    case 'Evaluación': return <IconFileText size={16} />;
    case 'Proyecto': return <IconCertificate size={16} />;
    default: return <IconBook size={16} />;
  }
};

export const Dashboard: StoryObj = {
  render: () => (
    <Shell 
      mode="app"
      user={{ name: 'Sebastian Valenzuela', role: 'Estudiante' }}
    >
      <Container size="xl" py="xl">
        <Grid gutter="xl">
          {/* Main Content */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="light" color="brand" radius="xs">{MOCK_COURSE.code}</Badge>
                  <Text size="sm" c="dimmed">{MOCK_COURSE.period}</Text>
                </Group>
                <Title order={1} fw={900} style={{ letterSpacing: -1 }}>{MOCK_COURSE.title}</Title>
              </Stack>

              <Accordion variant="separated" defaultValue={['u1', 'u2']} multiple radius="xs">
                {UNITS.map((unit) => (
                  <Accordion.Item key={unit.id} value={unit.id} mb="sm" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
                    <Accordion.Control>
                      <Group justify="space-between" pr="md">
                        <Group>
                          <ThemeIcon variant="light" color="brand" radius="xs" size="lg">
                            <IconBook size={20} />
                          </ThemeIcon>
                          <Stack gap={0}>
                            <Text fw={700} size="lg">{unit.title}</Text>
                            <Text size="xs" c="dimmed">Peso Total: {unit.weight}% de la nota</Text>
                          </Stack>
                        </Group>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs" mt="sm">
                        {unit.activities.map((activity) => (
                          <Paper 
                            key={activity.id} 
                            p="md" 
                            radius="xs" 
                            withBorder 
                            style={{ 
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'var(--mantine-color-secondary-0)' }
                            }}
                          >
                            <Group justify="space-between">
                              <Group gap="md">
                                <ThemeIcon variant="subtle" color="brand" size="md">
                                  {getTypeIcon(activity.type)}
                                </ThemeIcon>
                                <Stack gap={0}>
                                  <Text fw={600} size="sm">{activity.title}</Text>
                                  <Text size="xs" c="dimmed">{activity.type} • Peso: {activity.weight}%</Text>
                                </Stack>
                              </Group>
                              <Group gap="xl">
                                {activity.grade && (
                                  <Stack gap={0} align="flex-end">
                                    <Text fw={800} size="lg" color="brand.7">{activity.grade.toFixed(1)}</Text>
                                    <Text size="10px" tt="uppercase" fw={700} c="dimmed">Nota</Text>
                                  </Stack>
                                )}
                                <Badge 
                                  variant="light" 
                                  color={getStatusColor(activity.status)} 
                                  radius="xs" 
                                  size="sm"
                                  w={100}
                                >
                                  {activity.status}
                                </Badge>
                                <IconChevronRight size={18} color="var(--mantine-color-gray-4)" />
                              </Group>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Stack>
          </Grid.Col>

          {/* Sidebar / Stats */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xl">
              <Card p="xl" radius="xs" withBorder shadow="sm">
                <Stack gap="lg">
                  <Group justify="space-between">
                    <Title order={4}>Resumen Académico</Title>
                    <IconChartBar size={24} color="var(--mantine-color-brand-6)" />
                  </Group>
                  
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text size="sm" fw={600}>Progreso del Curso</Text>
                      <Text size="sm" fw={700} c="brand">{MOCK_COURSE.progress}%</Text>
                    </Group>
                    <Progress value={MOCK_COURSE.progress} color="brand" radius="xs" size="lg" striped animated />
                  </Stack>

                  <Divider />

                  <Grid gutter="xs">
                    <Grid.Col span={6}>
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed" tt="uppercase">Peso Calificado</Text>
                        <Text fw={800} size="xl">{MOCK_COURSE.gradedWeight}%</Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed" tt="uppercase">Restante</Text>
                        <Text fw={800} size="xl">{MOCK_COURSE.totalWeight - MOCK_COURSE.gradedWeight}%</Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>

                  <Button fullWidth color="brand" radius="xs" size="md">
                    Ver Plan de Estudios
                  </Button>
                </Stack>
              </Card>

              <Card p="xl" radius="xs" withBorder shadow="sm">
                <Title order={4} mb="md">Información</Title>
                <Stack gap="md">
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="brand" radius="xs"><IconUser size={18} /></ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">Profesor</Text>
                      <Text size="sm" fw={600}>{MOCK_COURSE.teacher}</Text>
                    </Stack>
                  </Group>
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="brand" radius="xs"><IconCalendar size={18} /></ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">Próxima Clase</Text>
                      <Text size="sm" fw={600}>Lunes, 08:00 AM</Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Shell>
  )
};
