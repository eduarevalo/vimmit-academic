import type { Meta, StoryObj } from '@storybook/react';
import { PublicShell } from '../../components/PublicLayout/PublicShell';
import { HeroSection } from '../../components/PublicLayout/HeroSection';
import { FeatureGrid } from '../../components/PublicLayout/FeatureGrid';
import { NarrativeBlock } from '../../components/PublicLayout/NarrativeBlock';
import { IconUsers, IconLeaf, IconGlobe, IconHeartHandshake } from '@tabler/icons-react';
import { Box, Container, Title, Text, Stack } from '@mantine/core';

const meta: Meta = {
  title: 'Templates/Public/Social Impact',
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
        { label: 'Impacto Social', link: '#' },
      ]
    }
  ]
};

export const Default: StoryObj = {
  render: () => (
    <PublicShell headerProps={headerProps} footerProps={footerProps}>
      <HeroSection 
        title="Educación que Transforma Realidades"
        subtitle="Nuestro compromiso va más allá de las aulas. Trabajamos para generar un impacto positivo y sostenible en las comunidades donde estamos presentes."
        image="/assets/placeholders/community.png"
      />

      <FeatureGrid 
        title="Nuestro Impacto en Cifras"
        subtitle="Pequeñas acciones constantes generan grandes transformaciones sociales."
        features={[
          { 
            icon: IconUsers, 
            title: '+25k Egresados', 
            description: 'Profesionales que hoy impactan sus entornos laborales y sociales.',
            color: 'brand' 
          },
          { 
            icon: IconLeaf, 
            title: 'Sostenibilidad', 
            description: 'Proyectos activos de reforestación y gestión de recursos.',
            color: 'teal'
          },
          { 
            icon: IconHeartHandshake, 
            title: 'Becas Sociales', 
            description: 'Más de 5,000 becas otorgadas a talentos de zonas vulnerables.',
            color: 'brand'
          },
          { 
            icon: IconGlobe, 
            title: 'Impacto Global', 
            description: 'Presencia en 15 regiones con proyectos de desarrollo comunitario.',
            color: 'secondary'
          }
        ]}
      />

      <NarrativeBlock 
        badge="Historias de Éxito"
        title="El Poder de la Oportunidad"
        image="/assets/placeholders/medical_lab.png"
        imagePosition="left"
        description={
          <Stack gap="md">
            <Text>"Gracias a la beca Vimmit, pude ser el primer profesional de mi familia. Hoy lidero un proyecto de telemedicina que atiende a miles en mi región nativa."</Text>
            <Text fw={700}>— Roberto M., Ingeniero de Software</Text>
          </Stack>
        }
      />

      <NarrativeBlock 
        badge="Medio Ambiente"
        title="Educando para un Planeta Verde"
        image="/assets/placeholders/community.png"
        imagePosition="right"
        backgroundColor="var(--mantine-color-gray-0)"
        description={
          <Stack gap="md">
            <Text>Nuestras sedes están diseñadas con estándares de eficiencia energética y nuestros estudiantes participan activamente en programas de economía circular.</Text>
            <Text>Comprometidos con la neutralidad de carbono para el año 2030 en todas nuestras operaciones institucionales.</Text>
          </Stack>
        }
      />
    </PublicShell>
  )
};
