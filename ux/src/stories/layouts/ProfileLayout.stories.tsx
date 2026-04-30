import type { Meta, StoryObj } from '@storybook/react';
import { Shell } from '../../components/Shell/Shell';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  Title, Text, Stack, Group, Badge, Avatar, Box, Container, Grid, Tabs, SimpleGrid, Paper, ThemeIcon
} from '@mantine/core';
import { 
  IconUser, IconSchool, IconMail, IconPhone, IconCalendar, IconCertificate, IconSettings, IconCreditCard, IconChartBar, IconChevronRight
} from '@tabler/icons-react';

const meta: Meta = {
  title: 'Templates/Profile Layout',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const StudentProfile: StoryObj = {
  render: () => (
    <Shell 
      mode="app"
      user={{ name: 'Admin User', role: 'Super Admin' }}
    >
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Hero / Header Section */}
          <Paper 
            radius="xs" 
            p="xl" 
            withBorder 
            shadow="sm"
            style={{ 
              backgroundColor: '#ffffff',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Group gap={30} align="flex-start" wrap="nowrap">
              <Avatar 
                size={120} 
                radius="xs" 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80"
                style={{ border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group justify="space-between">
                  <Box>
                    <Title order={1} fw={900} style={{ letterSpacing: -1 }}>Sebastian Valenzuela</Title>
                    <Group gap="xs">
                      <Badge color="brand" variant="light" radius="xs">Estudiante Activo</Badge>
                      <Text size="sm" c="dimmed">ID: #ST-99238</Text>
                    </Group>
                  </Box>
                  <Group>
                    <Button variant="outline" color="secondary" radius="xs">Editar Perfil</Button>
                    <Button color="brand" radius="xs">Contactar</Button>
                  </Group>
                </Group>
                
                <SimpleGrid cols={{ base: 1, sm: 3 }} mt="md">
                  <Group gap="xs">
                    <IconMail size={16} color="var(--mantine-color-secondary-4)" />
                    <Text size="sm">s.valenzuela@vimmit.com</Text>
                  </Group>
                  <Group gap="xs">
                    <IconPhone size={16} color="var(--mantine-color-secondary-4)" />
                    <Text size="sm">+56 9 1234 5678</Text>
                  </Group>
                  <Group gap="xs">
                    <IconCalendar size={16} color="var(--mantine-color-secondary-4)" />
                    <Text size="sm">Desde Marzo 2024</Text>
                  </Group>
                </SimpleGrid>
              </Stack>
            </Group>
          </Paper>

          {/* Statistics Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {[
              { label: 'Promedio General', value: '4.8 / 5.0', icon: IconChartBar, color: 'secondary' },
              { label: 'Créditos Aprobados', value: '124', icon: IconCertificate, color: 'brand' },
              { label: 'Asistencia Total', value: '98%', icon: IconUser, color: 'brand' },
              { label: 'Estado Financiero', value: 'Al día', icon: IconCreditCard, color: 'secondary' },
            ].map((stat, i) => (
              <Card key={i} p="md" radius="xs" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">{stat.label}</Text>
                  <ThemeIcon color={stat.color} variant="light" size="sm" radius="xs">
                    <stat.icon size={14} />
                  </ThemeIcon>
                </Group>
                <Text fw={800} size="xl">{stat.value}</Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* Main Content Area with Tabs */}
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card p={0} radius="xs" withBorder>
                <Tabs defaultValue="overview">
                  <Tabs.List px="md" pt="xs">
                    <Tabs.Tab value="overview" leftSection={<IconSchool size={16} />} color="secondary">Academia</Tabs.Tab>
                    <Tabs.Tab value="activity" leftSection={<IconChartBar size={16} />} color="secondary">Actividad</Tabs.Tab>
                    <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />} color="secondary">Configuración</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="overview" p="xl">
                    <Stack gap="lg">
                      <Box>
                        <Title order={4} mb="xs">Programas Inscritos</Title>
                        <Stack gap="sm">
                          <Paper withBorder p="md" radius="xs" style={{ borderLeft: '4px solid var(--mantine-color-brand-6)' }}>
                            <Group justify="space-between">
                              <Stack gap={2}>
                                <Text fw={700}>Ingeniería de Software</Text>
                                <Text size="xs" c="dimmed">Facultad de Tecnología • 8vo Semestre</Text>
                              </Stack>
                              <Badge color="brand">En Curso</Badge>
                            </Group>
                          </Paper>
                          <Paper withBorder p="md" radius="xs" style={{ borderLeft: '4px solid var(--mantine-color-secondary-6)' }}>
                            <Group justify="space-between">
                              <Stack gap={2}>
                                <Text fw={700}>Certificación en Cloud Computing</Text>
                                <Text size="xs" c="dimmed">Extensión Académica • Nivel Avanzado</Text>
                              </Stack>
                              <Badge color="secondary" variant="light">Completado</Badge>
                            </Group>
                          </Paper>
                        </Stack>
                      </Box>
                      
                      <Box>
                        <Title order={4} mb="xs">Documentos Recientes</Title>
                        <Stack gap="xs">
                          {['Certificado de Alumno Regular', 'Malla Curricular 2024', 'Historial de Notas'].map(doc => (
                            <Group key={doc} justify="space-between" p="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-1)' }}>
                              <Text size="sm">{doc}</Text>
                              <IconChevronRight size={16} color="var(--mantine-color-secondary-3)" />
                            </Group>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Tabs.Panel>
                  
                  <Tabs.Panel value="activity" p="xl">
                    <Text c="dimmed" ta="center" py="xl">Flujo de actividad reciente...</Text>
                  </Tabs.Panel>
                </Tabs>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xl">
                <Card p="md" radius="xs" withBorder>
                  <Title order={4} mb="sm">Próximos Eventos</Title>
                  <Stack gap="md">
                    <Group wrap="nowrap">
                      <Box 
                        p="xs" 
                        ta="center" 
                        style={{ backgroundColor: 'var(--mantine-color-brand-0)', borderRadius: 4, minWidth: 50 }}
                      >
                        <Text size="sm" fw={800} color="brand">24</Text>
                        <Text size="xs" color="brand" tt="uppercase">Abr</Text>
                      </Box>
                      <Box>
                        <Text size="sm" fw={700}>Examen de Algoritmos</Text>
                        <Text size="xs" c="dimmed">14:00 - Salón B2</Text>
                      </Box>
                    </Group>
                    <Group wrap="nowrap">
                      <Box 
                        p="xs" 
                        ta="center" 
                        style={{ backgroundColor: 'var(--mantine-color-secondary-0)', borderRadius: 4, minWidth: 50 }}
                      >
                        <Text size="sm" fw={800} color="secondary">02</Text>
                        <Text size="xs" color="secondary" tt="uppercase">May</Text>
                      </Box>
                      <Box>
                        <Text size="sm" fw={700}>Entrega Tesis Fase 1</Text>
                        <Text size="xs" c="dimmed">Online - 23:59</Text>
                      </Box>
                    </Group>
                  </Stack>
                </Card>

                <Paper p="xl" radius="xs" bg="secondary.9" c="white">
                  <Stack gap="xs">
                    <Text size="sm" fw={700}>¿Necesitas ayuda?</Text>
                    <Text size="xs" style={{ opacity: 0.8 }}>Contacta a bienestar estudiantil para cualquier duda o apoyo académico.</Text>
                    <Button variant="white" color="secondary" size="compact-xs" mt="xs" fullWidth>Contactar</Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Shell>
  )
};
