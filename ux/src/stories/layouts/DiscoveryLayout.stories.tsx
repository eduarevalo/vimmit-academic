import type { Meta, StoryObj } from '@storybook/react';
import { PublicShell } from '../../components/PublicLayout/PublicShell';
import { HeroSection } from '../../components/PublicLayout/HeroSection';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  Container, 
  SimpleGrid, 
  Text, 
  Title, 
  Stack, 
  AspectRatio, 
  Image, 
  Badge, 
  Group,
  TextInput,
  Box,
  Divider,
  rem
} from '@mantine/core';
import { IconSearch, IconMapPin, IconClock } from '@tabler/icons-react';

const meta: Meta = {
  title: 'Templates/Public/Discovery Layouts',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const headerProps = {
  links: [
    { label: 'Inicio', link: '#' },
    { label: 'Programas', link: '#' },
    { label: 'Admisiones', link: '#' },
    { label: 'Sedes', link: '#' },
    { label: 'Nosotros', link: '#' },
  ],
  onLogin: () => console.log('Login clicked')
};

const footerProps = {
  sections: [
    {
      title: 'Académico',
      links: [
        { label: 'Programas', link: '#' },
        { label: 'Admisiones', link: '#' },
      ]
    },
    {
      title: 'Institución',
      links: [
        { label: 'Sobre Nosotros', link: '#' },
        { label: 'Sedes', link: '#' },
      ]
    }
  ]
};

export const AcademicPrograms: StoryObj = {
  render: () => (
    <PublicShell headerProps={headerProps} footerProps={footerProps}>
      <HeroSection 
        title="Nuestra Oferta Académica"
        subtitle="Explora nuestros programas diseñados para los desafíos del mañana. Tecnología, negocios y ciencias con un enfoque práctico."
        image="/assets/placeholders/hero_main.png"
      />

      <Container size="xl" py={80}>
        <Stack gap="xl">
          <Group justify="space-between" align="center">
            <Title order={2}>Todos los Programas</Title>
            <TextInput 
              placeholder="Buscar programa..." 
              leftSection={<IconSearch size={18} />} 
              style={{ width: rem(300) }}
              radius="xs"
            />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {[
              { title: 'Ingeniería de Software', type: 'Pregrado', duration: '10 Semestres', campus: 'Sede Central' },
              { title: 'Diseño UX/UI Avanzado', type: 'Diplomado', duration: '6 Meses', campus: 'Online' },
              { title: 'Ciencia de Datos', type: 'Magíster', duration: '4 Semestres', campus: 'Sede Central' },
              { title: 'Inteligencia Artificial', type: 'Ingeniería', duration: '10 Semestres', campus: 'Sede Norte' },
              { title: 'Gestión Tecnológica', type: 'MBA', duration: '3 Semestres', campus: 'Sede Sur' },
              { title: 'Ciberseguridad', type: 'Especialidad', duration: '2 Semestres', campus: 'Híbrido' },
            ].map((program, i) => (
              <Card key={i} p={0} radius="xs" withBorder shadow="sm">
                <AspectRatio ratio={16 / 9}>
                  <Image src="/assets/placeholders/tech_hub.png" alt={program.title} />
                </AspectRatio>
                <Stack p="xl" gap="md">
                  <Group justify="space-between">
                    <Badge color="brand" variant="light" radius="xs">{program.type}</Badge>
                    <Group gap={4}>
                      <IconClock size={14} color="var(--mantine-color-gray-5)" />
                      <Text size="xs" c="dimmed">{program.duration}</Text>
                    </Group>
                  </Group>
                  <Title order={4}>{program.title}</Title>
                  <Group gap={4}>
                    <IconMapPin size={14} color="var(--mantine-color-gray-5)" />
                    <Text size="xs" c="dimmed">{program.campus}</Text>
                  </Group>
                  <Button fullWidth color="brand" radius="xs" mt="md">Ver Detalles</Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </PublicShell>
  )
};

export const InstitutionalCampuses: StoryObj = {
  render: () => (
    <PublicShell headerProps={headerProps} footerProps={footerProps}>
      <HeroSection 
        title="Nuestras Sedes"
        subtitle="Espacios diseñados para la innovación, la colaboración y el máximo rendimiento académico."
        image="/assets/placeholders/campus_nature.png"
      />

      <Container size="xl" py={80}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
          {[
            { name: 'Sede Central (Innovación)', address: 'Av. Libertador 1234, Santiago', features: 'Laboratorios IA, Biblioteca 24/7' },
            { name: 'Sede Norte (Tecnología)', address: 'Huerfanos 567, Providencia', features: 'Auditorio, Coworking, Makerspace' },
            { name: 'Sede Sur (Negocios)', address: 'Gran Avenida 890, San Miguel', features: 'Salas de Simulación, Centro de Emprendimiento' },
            { name: 'Campus Online', address: 'Global', features: 'Plataforma 24/7, Aulas Virtuales 3D' },
          ].map((campus, i) => (
            <Card key={i} p={0} radius="xs" withBorder shadow="sm">
              <Group wrap="nowrap" align="stretch" gap={0}>
                <Box visibleFrom="sm" style={{ flex: 1 }}>
                  <Image h="100%" src="/assets/placeholders/tech_hub.png" alt={campus.name} />
                </Box>
                <Stack p="xl" style={{ flex: 1.2 }}>
                  <Title order={3} size="h4">{campus.name}</Title>
                  <Text size="sm" c="dimmed">{campus.address}</Text>
                  <Divider label="Equipamiento" labelPosition="left" />
                  <Text size="xs">{campus.features}</Text>
                  <Button variant="light" color="secondary" radius="xs" mt="xl" rightSection={<IconMapPin size={16} />}>
                    Ver Mapa y Horarios
                  </Button>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </PublicShell>
  )
};

