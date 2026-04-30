import { Container, Stack, Paper, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/common/PageHeader';

export function CoursesPage() {
  const { t } = useTranslation();

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={t('portal.courses.title')}
          subtitle={t('portal.courses.subtitle')}
        />

        <Paper withBorder p="xl" radius="xs" ta="center">
          <Text c="dimmed">{t('portal.programsManagement.list.empty')}</Text>
        </Paper>
      </Stack>
    </Container>
  );
}
