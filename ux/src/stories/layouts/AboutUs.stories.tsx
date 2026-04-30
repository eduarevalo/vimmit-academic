import type { Meta, StoryObj } from '@storybook/react';
import { PublicShell } from '../../components/PublicLayout/PublicShell';
import { HeroSection } from '../../components/PublicLayout/HeroSection';
import { NarrativeBlock } from '../../components/PublicLayout/NarrativeBlock';
import { Box, Container, Title, Text, SimpleGrid, Paper, Stack } from '@mantine/core';

const meta: Meta = {
  title: 'Templates/Public/About Us',
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
        { label: 'Calendario', link: '#' },
        { label: 'Admisiones', link: '#' },
      ]
    },
    {
      title: 'Institución',
      links: [
        { label: 'Sobre Nosotros', link: '#' },
        { label: 'Sedes', link: '#' },
        { label: 'Impacto Social', link: '#' },
      ]
    }
  ]
};

export const Default: StoryObj = {
  render: () => (
    <PublicShell headerProps={headerProps} footerProps={footerProps}>
      <HeroSection 
        title="Más que una Institución, una Comunidad"
        subtitle="Conoce nuestra historia, nuestra misión y el compromiso que tenemos con el desarrollo de cada uno de nuestros estudiantes."
        image="/assets/placeholders/hero_main.png"
      />

      <NarrativeBlock 
        badge="Nuestra Historia"
        title="Forjando el Futuro desde la Experiencia"
        image="/assets/placeholders/students.png"
        imagePosition="left"
        description={
          <Stack gap="md">
            <Text>Fundada con el propósito de democratizar el acceso a la educación de alta calidad, Vimmit Academic ha evolucionado hasta convertirse en un referente de innovación educativa en la región.</Text>
            <Text>Nuestra trayectoria está marcada por el éxito de nuestros egresados, quienes hoy lideran proyectos tecnológicos y sociales en todo el mundo.</Text>
          </Stack>
        }
      />

      <NarrativeBlock 
        badge="Nuestra Filosofía"
        title="Innovación y Ética en el Corazón"
        image="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop"
        imagePosition="right"
        backgroundColor="var(--mantine-color-gray-0)"
        description={
          <Stack gap="md">
            <Text>Creemos que la tecnología es un medio, no un fin. Por eso, integramos la ética y el pensamiento crítico en cada una de nuestras facultades.</Text>
            <Text>Buscamos no solo formar profesionales competentes, sino ciudadanos responsables y visionarios que entiendan el impacto de sus acciones en la sociedad global.</Text>
          </Stack>
        }
      />

      <Container size="xl" py={100}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60}>
          <Paper p="xl" radius="xs" withBorder>
            <Title order={3} mb="md">Misión</Title>
            <Text c="dimmed" style={{ lineHeight: 1.8 }}>
              Inspirar y capacitar a la próxima generación de líderes globales a través de una educación rigurosa, innovadora y accesible, integrando la tecnología como motor de cambio social y profesional.
            </Text>
          </Paper>
          <Paper p="xl" radius="xs" withBorder>
            <Title order={3} mb="md">Visión</Title>
            <Text c="dimmed" style={{ lineHeight: 1.8 }}>
              Ser la institución educativa líder en el ecosistema digital, reconocida por nuestra excelencia académica, el éxito integral de nuestros egresados y nuestra contribución al desarrollo sostenible.
            </Text>
          </Paper>
        </SimpleGrid>
      </Container>
    </PublicShell>
  )
};
