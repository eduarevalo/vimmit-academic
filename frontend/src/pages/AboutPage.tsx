import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ScrollSection } from '../components/ScrollSection';

const BG_HISTORY = '/assets/bg_academic.png';
const BG_MISSION = '/assets/bg_career.png';

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <Stack gap={0}>
      <ScrollSection 
        id="about-history"
        backgroundImage={BG_HISTORY} 
        title={t('aboutPage.history.title')}
      >
        <Stack gap="md">
          <Text size="lg">{t('aboutPage.history.p1')}</Text>
          <Text size="lg">{t('aboutPage.history.p2')}</Text>
          <Text size="lg">{t('aboutPage.history.p3')}</Text>
        </Stack>
      </ScrollSection>

      <ScrollSection 
        id="about-mission"
        backgroundImage={BG_MISSION} 
        title={t('aboutPage.mission.title')}
      >
        <Stack gap="md">
          <Text size="lg">{t('aboutPage.mission.p1')}</Text>
          <Text size="lg">{t('aboutPage.mission.p2')}</Text>
          <Text size="lg">{t('aboutPage.mission.p3')}</Text>
        </Stack>
      </ScrollSection>
    </Stack>
  );
}
