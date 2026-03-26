import { Container, Stack, Title, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function EnrollmentsPage() {
  const { t } = useTranslation();

  return (
    <Container size="lg" py={40}>
      <Stack gap={4}>
        <Title order={2}>{t('portal.nav.enrollments')}</Title>
        <Text c="dimmed" size="sm">{t('portal.nav.enrollmentsSubtitle')}</Text>
      </Stack>
    </Container>
  );
}
