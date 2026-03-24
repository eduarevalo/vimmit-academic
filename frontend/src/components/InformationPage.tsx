import { Stack, Text, Button, Group, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ScrollSection } from './ScrollSection';
import { useRegistrationModal } from '../hooks/useRegistrationModal';

const BG_ACADEMIC = '/assets/bg_academic.png';
const BG_CAREER = '/assets/bg_career.png';
const BG_LIFE = '/assets/bg_student_life.png';

export function InformationPage() {
  const { t } = useTranslation();
  const { open } = useRegistrationModal();

  return (
    <Stack gap={0}>
      <ScrollSection 
        id="info-academic"
        backgroundImage={BG_ACADEMIC} 
        title={t('infoPage.academic.title')}
      >
        <Stack gap="md">
          <Text size="lg">{t('infoPage.academic.p1')}</Text>
          <Text size="lg">{t('infoPage.academic.p2')}</Text>
          <Text size="lg">{t('infoPage.academic.p3')}</Text>
        </Stack>
      </ScrollSection>

      <ScrollSection 
        id="info-career"
        backgroundImage={BG_CAREER} 
        title={t('infoPage.career.title')}
      >
        <Stack gap="md">
          <Text size="lg">{t('infoPage.career.p1')}</Text>
          <Text size="lg">{t('infoPage.career.p2')}</Text>
          <Text size="lg">{t('infoPage.career.p3')}</Text>
          <Group mt="xl">
            <Button size="lg" radius="xl" color="brand" onClick={open}>
              {t('registration.submit')}
            </Button>
          </Group>
        </Stack>
      </ScrollSection>

      <ScrollSection 
        id="info-life"
        backgroundImage={BG_LIFE} 
        title={t('infoPage.life.title')}
      >
        <Stack gap="md">
          <Text size="lg">{t('infoPage.life.p1')}</Text>
          <Text size="lg">{t('infoPage.life.p2')}</Text>
          <Center mt="xl">
             <Button variant="light" color="brand" size="xl" radius="xl" onClick={open}>
               {t('header.startJourney')}
             </Button>
          </Center>
        </Stack>
      </ScrollSection>
    </Stack>
  );
}
