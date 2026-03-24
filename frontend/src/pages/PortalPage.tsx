import { Container, Stack, Title, Text, Button, Paper, Group } from '@mantine/core';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

import { useTranslation } from 'react-i18next';

export function PortalPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Container size="xs" py={100}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Stack gap="md">
            <Title order={2} ta="center">{t('portal.accessRequired')}</Title>
            <Text ta="center" c="dimmed" mb="md">{t('portal.loginNotice')}</Text>
            <LoginForm />
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py={60}>
      <Stack align="center" gap="xl">
        <Title order={1}>{t('portal.title')}</Title>
        <Text size="lg" c="dimmed" ta="center" style={{ maxWidth: 600 }}>
          {t('portal.welcome')}
        </Text>
        <Group>
          <Button size="lg" radius="xl" color="brand" variant="light">
            {t('portal.exploreResources')}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
