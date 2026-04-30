import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeroSection, FeatureGrid, Button as VimmitButton } from '@ux/index';
import { IconSchool, IconGlobe, IconCertificate, IconUsers } from '@tabler/icons-react';
import { Box, Container, Stack, Title, Text } from '@mantine/core';

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <HeroSection 
        title={<>Transforma tu futuro en <span style={{ color: 'var(--mantine-color-brand-6)' }}>Aseder</span></>}
        subtitle="Formamos líderes con visión global, tecnología de vanguardia y un compromiso inquebrantable con la excelencia académica."
        image="/assets/aseder_graduation.png"
        ctaPrimary={{ label: 'Explorar Programas', onClick: () => navigate('/programs') }}
        ctaSecondary={{ label: 'Admisiones 2024', onClick: () => navigate('/admissions') }}
      />

      <FeatureGrid 
        title="Experiencia Educativa Premium"
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

      <Box py={100} bg="brand.6" c="white">
        <Container size="md">
          <Stack gap="xl" align="center" ta="center">
            <Title order={2} size={42} fw={900}>¿Listo para iniciar tu camino?</Title>
            <Text size="xl" style={{ opacity: 0.9 }}>Únete a los miles de estudiantes que están redefiniendo sus carreras en Aseder.</Text>
            <VimmitButton size="xl" variant="white" color="brand" radius="xs" onClick={() => navigate('/admissions')}>
              Comenzar Proceso de Admisión
            </VimmitButton>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
