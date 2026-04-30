import type { Meta, StoryObj } from '@storybook/react';
import { PublicShell } from '../../components/PublicLayout/PublicShell';
import { HeroSection } from '../../components/PublicLayout/HeroSection';
import { FeatureGrid } from '../../components/PublicLayout/FeatureGrid';
import { IconSchool, IconUsers, IconCertificate, IconGlobe } from '@tabler/icons-react';
import { Box, Button, Text, Title, Container, Stack } from '@mantine/core';

const meta: Meta = {
  title: 'Templates/Public/Landing Page',
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
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Contacto', link: '#' },
        { label: 'Preguntas Frecuentes', link: '#' },
        { label: 'Portal Estudiante', link: '#' },
      ]
    }
  ]
};

export const Default: StoryObj = {
  render: () => (
    <PublicShell headerProps={headerProps} footerProps={footerProps}>
      <HeroSection 
        title={<>Transforma tu futuro en <span style={{ color: 'var(--mantine-color-brand-6)' }}>Vimmit Academic</span></>}
        subtitle="Formamos líderes con visión global, tecnología de vanguardia y un compromiso inquebrantable con la excelencia académica y el impacto social."
        image="/assets/placeholders/hero_main.png"
        ctaPrimary={{ label: 'Explorar Programas' }}
        ctaSecondary={{ label: 'Admisiones 2024' }}
      />

      <FeatureGrid 
        title="Por qué elegir Vimmit"
        subtitle="Nuestra metodología combina la teoría rigurosa con la práctica tecnológica para preparar a los profesionales del mañana."
        features={[
          { 
            icon: IconSchool, 
            title: 'Excelencia Académica', 
            description: 'Mallas curriculares actualizadas y docentes de clase mundial.',
            color: 'brand' 
          },
          { 
            icon: IconGlobe, 
            title: 'Visión Internacional', 
            description: 'Convenios con las mejores universidades y centros de investigación.',
            color: 'secondary'
          },
          { 
            icon: IconCertificate, 
            title: 'Certificación Global', 
            description: 'Títulos reconocidos internacionalmente en áreas de alta demanda.',
            color: 'brand'
          },
          { 
            icon: IconUsers, 
            title: 'Comunidad Vibrante', 
            description: 'Un ecosistema de colaboración y networking constante.',
            color: 'secondary'
          }
        ]}
      />

      {/* CTA Section */}
      <Box py={100} bg="brand.6" c="white">
        <Container size="md">
          <Stack gap="xl" align="center" ta="center">
            <Title order={2} size={42} fw={900}>¿Listo para iniciar tu camino?</Title>
            <Text size="xl" style={{ opacity: 0.9 }}>Únete a los miles de estudiantes que están redefiniendo sus carreras en Vimmit Academic.</Text>
            <Button size="xl" variant="white" color="brand" radius="xs">Comenzar Proceso de Admisión</Button>
          </Stack>
        </Container>
      </Box>
    </PublicShell>
  )
};
