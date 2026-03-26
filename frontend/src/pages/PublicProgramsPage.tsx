import { Stack, Text, Container, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ProgramsSection } from '../components/ProgramsSection';

export function PublicProgramsPage() {
  const { t } = useTranslation();

  return (
    <Stack gap="xl" py={80}>
      <Container size="lg">
        <Stack align="center" gap="md" mb={50}>
          <Title order={1} size="h1" fw={900}>{t('publicProgramsPage.title')}</Title>
          <Text size="xl" c="dimmed" ta="center" style={{ maxWidth: 800 }}>
            {t('publicProgramsPage.subtitle')}
          </Text>
        </Stack>
        <ProgramsSection />
      </Container>
    </Stack>
  );
}
