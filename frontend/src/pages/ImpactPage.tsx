import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HeroSection, FeatureGrid, NarrativeBlock } from '@ux/index';
import { IconUsers, IconTrophy, IconMapPin, IconLeaf } from '@tabler/icons-react';
import { Container, Paper, Text, Stack, Box } from '@mantine/core';

export function ImpactPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <HeroSection 
        title={t('impactPage.title')}
        subtitle={t('impactPage.subtitle')}
        image="/assets/aseder_graduation.png"
      />

      <Container size="xl" py={60}>
        <Paper p="xl" radius="xs" withBorder bg="gray.0" shadow="sm">
          <Text size="lg" style={{ lineHeight: 1.8 }}>
            {t('impactPage.intro')}
          </Text>
        </Paper>
      </Container>

      <FeatureGrid 
        title="Impacto en Cifras"
        subtitle="Nuestra presencia regional se traduce en oportunidades reales para el suroccidente colombiano."
        features={[
          { 
            icon: IconUsers, 
            title: t('impactPage.stats.graduates'), 
            description: t('impactPage.stats.graduatesLabel'),
            color: 'brand' 
          },
          { 
            icon: IconTrophy, 
            title: t('impactPage.stats.yearsExcelence.value'), 
            description: t('impactPage.stats.yearsExcelence.label'),
            color: 'secondary'
          },
          { 
            icon: IconMapPin, 
            title: t('impactPage.stats.regionalCampuses.value'), 
            description: t('impactPage.stats.regionalCampuses.label'),
            color: 'brand'
          },
          { 
            icon: IconLeaf, 
            title: t('impactPage.stats.activeStudents'), 
            description: t('impactPage.stats.activeLabel'),
            color: 'secondary'
          }
        ]}
      />

      <NarrativeBlock 
        badge={t('impactPage.stories.title')}
        title={t('impactPage.stories.naya.title')}
        image="/assets/aseder_medical.png"
        imagePosition="left"
        description={
          <Text size="lg" lh={1.8}>
            {t('impactPage.stories.naya.text')}
          </Text>
        }
      />

      <NarrativeBlock 
        title={t('impactPage.stories.communities.title')}
        image="/assets/aseder_graduation.png"
        imagePosition="right"
        backgroundColor="var(--mantine-color-gray-0)"
        description={
          <Text size="lg" lh={1.8}>
            {t('impactPage.stories.communities.text')}
          </Text>
        }
      />
    </>
  );
}
