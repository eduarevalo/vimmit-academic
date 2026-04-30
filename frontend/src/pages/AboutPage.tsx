import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HeroSection, NarrativeBlock, FeatureGrid } from '@ux/index';
import { IconSchool, IconUsers, IconTrophy, IconHeartHandshake } from '@tabler/icons-react';
import { Container, SimpleGrid, Paper, Title, Text, Stack } from '@mantine/core';

export function AboutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <HeroSection 
        title={t('aboutPage.hero.title')}
        subtitle={t('aboutPage.hero.subtitle')}
        image="/assets/aseder_graduation.png"
      />

      <NarrativeBlock 
        badge={t('aboutPage.history.tag')}
        title={t('aboutPage.history.title')}
        image="/assets/aseder_medical.png"
        imagePosition="left"
        description={
          <Stack gap="md">
            <Text>{t('aboutPage.history.p1')}</Text>
            <Text>{t('aboutPage.history.p2')}</Text>
            <Text fw={700} c="brand" style={{ fontStyle: 'italic' }}>
              "{t('aboutPage.history.quote')}"
            </Text>
          </Stack>
        }
      />

      <FeatureGrid 
        title={t('aboutPage.statsSection.title')}
        subtitle={t('aboutPage.statsSection.tag')}
        features={[
          { 
            icon: IconTrophy, 
            title: t('aboutPage.statsSection.items.years.value'), 
            description: t('aboutPage.statsSection.items.years.label'),
            color: 'brand' 
          },
          { 
            icon: IconUsers, 
            title: t('aboutPage.statsSection.items.graduates.value'), 
            description: t('aboutPage.statsSection.items.graduates.label'),
            color: 'secondary'
          },
          { 
            icon: IconSchool, 
            title: t('aboutPage.statsSection.items.programs.value'), 
            description: t('aboutPage.statsSection.items.programs.label'),
            color: 'brand'
          },
          { 
            icon: IconHeartHandshake, 
            title: t('aboutPage.statsSection.items.commitment.value'), 
            description: t('aboutPage.statsSection.items.commitment.label'),
            color: 'secondary'
          }
        ]}
      />

      <Container size="xl" py={100}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60}>
          <Paper p="xl" radius="xs" withBorder>
            <Title order={3} mb="md">{t('aboutPage.mission.titleText')}</Title>
            <Text c="dimmed" style={{ lineHeight: 1.8 }}>
              {t('aboutPage.mission.p1')} {t('aboutPage.mission.p2')}
            </Text>
          </Paper>
          <Paper p="xl" radius="xs" withBorder>
            <Title order={3} mb="md">{t('aboutPage.vision.titleText')}</Title>
            <Text c="dimmed" style={{ lineHeight: 1.8 }}>
              {t('aboutPage.vision.text')}
            </Text>
          </Paper>
        </SimpleGrid>
      </Container>
    </>
  );
}
