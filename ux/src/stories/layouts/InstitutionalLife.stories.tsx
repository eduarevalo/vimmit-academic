import type { Meta, StoryObj } from '@storybook/react';
import { PublicShell } from '../../components/PublicLayout/PublicShell';
import { HeroSection } from '../../components/PublicLayout/HeroSection';
import { FeatureGrid } from '../../components/PublicLayout/FeatureGrid';
import { NarrativeBlock } from '../../components/PublicLayout/NarrativeBlock';
import { IconClipboardCheck, IconUserPlus, IconFileCheck, IconCalendarEvent, IconPalette, IconDeviceLaptop, IconFriends, IconGlobe } from '@tabler/icons-react';
import { Container, Title, Text, Stack, Stepper, Paper, Button, rem, Box } from '@mantine/core';

const meta: Meta = {
  title: 'Templates/Public/Institutional Life',
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

export const AdmissionsProcess: StoryObj = {
  render: () => (
    <PublicShell headerProps={headerProps} footerProps={footerProps}>
      <HeroSection 
        title="Inicia tu Proceso de Admisión"
        subtitle="Todo lo que necesitas saber para formar parte de la próxima generación de profesionales Vimmit."
        image="/assets/placeholders/students.png"
      />

      <Container size="md" py={80}>
        <Stack gap={60}>
          <Box ta="center">
            <Title order={2} size={42} fw={900}>Tu camino en 4 pasos</Title>
            <Text c="dimmed" size="xl" mt="md">Un proceso transparente, ágil y totalmente digitalizado.</Text>
          </Box>

          <Stepper active={1} radius="xs" color="brand" orientation="vertical">
            <Stepper.Step 
              label="Postulación Online" 
              description="Completa el formulario inicial con tus datos básicos y el programa de tu interés."
              icon={<IconUserPlus size={20} />}
            />
            <Stepper.Step 
              label="Entrevista y Evaluación" 
              description="Conoce a nuestro equipo académico y realiza las pruebas específicas de tu facultad."
              icon={<IconClipboardCheck size={20} />}
            />
            <Stepper.Step 
              label="Carga de Documentos" 
              description="Sube de forma digital toda la documentación necesaria para tu matrícula."
              icon={<IconFileCheck size={20} />}
            />
            <Stepper.Step 
              label="Matrícula y Bienvenida" 
              description="¡Felicidades! Ya eres parte de Vimmit. Inicia tu proceso de inducción."
              icon={<IconCalendarEvent size={20} />}
            />
          </Stepper>

          <Paper p="xl" radius="xs" withBorder bg="secondary.0" style={{ borderLeft: '6px solid var(--mantine-color-brand-6)' }}>
            <Stack gap="sm">
              <Title order={4}>¿Necesitas ayuda con tu postulación?</Title>
              <Text size="sm">Contamos con un equipo de orientación listo para resolver todas tus dudas sobre becas, financiamiento y requisitos.</Text>
              <Button color="brand" radius="xs" w="fit-content" mt="md">Hablar con un orientador</Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </PublicShell>
  )
};

export const StudentLife: StoryObj = {
  render: () => (
    <PublicShell headerProps={headerProps} footerProps={footerProps}>
      <HeroSection 
        title="Vida Estudiantil en Vimmit"
        subtitle="Mucho más que estudio. Un entorno diseñado para el crecimiento personal, creativo y profesional."
        image="/assets/placeholders/campus_nature.png"
      />

      <FeatureGrid 
        title="Experiencias Extra-curriculares"
        subtitle="Desarrolla tus pasiones y habilidades blandas en nuestros diversos clubes y actividades."
        features={[
          { icon: IconPalette, title: 'Arte y Cultura', description: 'Talleres de diseño, música y expresiones creativas.', color: 'brand' },
          { icon: IconDeviceLaptop, title: 'Tech Clubs', description: 'Grupos de robótica, hacking ético y desarrollo de videojuegos.', color: 'secondary' },
          { icon: IconFriends, title: 'Deportes', description: 'Torneos inter-sedes y clubes de alto rendimiento.', color: 'brand' },
          { icon: IconGlobe, title: 'Global Exchange', description: 'Programas de intercambio y semanas internacionales.', color: 'secondary' },
        ]}
      />

      <NarrativeBlock 
        badge="Nuestras Sedes"
        title="Espacios que Inspiran"
        image="/assets/placeholders/tech_hub.png"
        imagePosition="left"
        description={
          <Stack gap="md">
            <Text>Nuestras cafeterías, áreas de descanso y makerspaces están diseñados para fomentar la colaboración espontánea y el intercambio de ideas.</Text>
            <Text>"Vimmit no es solo donde vengo a clases, es donde nació mi startup y donde encontré a mi equipo."</Text>
          </Stack>
        }
      />
    </PublicShell>
  )
};

