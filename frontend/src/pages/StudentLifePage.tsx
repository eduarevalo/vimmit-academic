import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HeroSection, FeatureGrid, NarrativeBlock } from '@ux/index';
import { IconMapPin, IconUsers, IconCertificate, IconPalette, IconDeviceLaptop, IconFriends, IconGlobe } from '@tabler/icons-react';
import { Container, Title, Text, Stack, Box, ThemeIcon, Group } from '@mantine/core';

export function StudentLifePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <HeroSection 
        title={t('studentLifePage.title')}
        subtitle={t('studentLifePage.subtitle')}
        image="/assets/aseder_graduation.png"
      />

      <FeatureGrid 
        title="Mucho más que estudio"
        subtitle="Un entorno diseñado para el crecimiento personal, creativo y profesional de nuestra comunidad."
        features={[
          { icon: IconPalette, title: 'Arte y Cultura', description: 'Talleres de diseño, música y expresiones creativas.', color: 'brand' },
          { icon: IconDeviceLaptop, title: 'Tech Clubs', description: 'Grupos de robótica, hacking ético y desarrollo de apps.', color: 'secondary' },
          { icon: IconFriends, title: 'Comunidad', description: 'Torneos inter-sedes y clubes de networking.', color: 'brand' },
          { icon: IconGlobe, title: 'Visión Global', description: 'Programas de intercambio y semanas internacionales.', color: 'secondary' },
        ]}
      />

      <NarrativeBlock 
        badge={t('studentLifePage.campus.title')}
        title="Espacios que Inspiran"
        image="/assets/campuses/santander.png"
        imagePosition="left"
        description={
          <Stack gap="md">
            <Text size="lg">{t('studentLifePage.campus.p1')}</Text>
            <Text>{t('studentLifePage.campus.p2')}</Text>
          </Stack>
        }
      />

      <NarrativeBlock 
        badge={t('studentLifePage.impact.title')}
        title={t('studentLifePage.leaders.title')}
        image="/assets/aseder_medical.png"
        imagePosition="right"
        backgroundColor="var(--mantine-color-gray-0)"
        description={
          <Stack gap="md">
            <Text size="lg">{t('studentLifePage.impact.p1')}</Text>
            <Text>{t('studentLifePage.impact.p2')}</Text>
          </Stack>
        }
      />

      <Container size="xl" py={80}>
        <Stack align="center" gap="xl">
          <Group gap={60} justify="center">
            {[
              { icon: IconCertificate, label: t('studentLifePage.leaders.item1') },
              { icon: IconUsers, label: t('studentLifePage.leaders.item2') },
              { icon: IconMapPin, label: t('studentLifePage.leaders.item3') }
            ].map((item, idx) => (
              <Stack key={idx} align="center" gap="sm">
                <ThemeIcon size={80} radius="xs" variant="light" color="brand">
                  <item.icon size={40} />
                </ThemeIcon>
                <Text fw={700} size="lg">{item.label}</Text>
              </Stack>
            ))}
          </Group>
        </Stack>
      </Container>
    </>
  );
}

