import { Container, Stack, Title, Text, Button, Paper, Group } from '@mantine/core';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const isPortal = location.pathname.startsWith('/portal');

  // Logic for Portal context
  if (isPortal) {
    if (!isAuthenticated) {
      return (
        <Container size="xs" py={100}>
          <Paper withBorder shadow="md" p={30} radius="md">
            <Stack gap="md">
              <Title order={2} ta="center">{t('portal.notFound.title')}</Title>
              <Text ta="center" c="dimmed" mb="md">{t('portal.notFound.loginNotice')}</Text>
              <LoginForm />
            </Stack>
          </Paper>
        </Container>
      );
    }

    return (
      <Container size="lg" py={60}>
        <Stack align="center" gap="xl" py={40}>
          <Title order={1}>{t('portal.notFound.title')}</Title>
          <Text size="lg" c="dimmed" ta="center" style={{ maxWidth: 600 }}>
            {t('portal.notFound.subtitle')}
          </Text>
          <Group>
            <Button 
              size="lg" 
              radius="xl" 
              color="brand" 
              variant="light"
              leftSection={<IconArrowLeft size={22} />}
              onClick={() => navigate('/portal')}
            >
              {t('portal.notFound.backPortal')}
            </Button>
          </Group>
        </Stack>
      </Container>
    );
  }

  // Logic for Public context
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Container size="md">
        <Paper withBorder p={60} radius="xl" shadow="xl" style={{ borderTop: '6px solid var(--mantine-color-brand-6)' }}>
          <Stack align="center" gap="xl">
            <Title order={1} style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, color: 'var(--mantine-color-brand-6)', opacity: 0.8 }}>
              404
            </Title>
            
            <Stack align="center" gap={8}>
              <Title order={2} ta="center" size="h1" fw={800}>{t('portal.notFound.title')}</Title>
              <Text c="dimmed" size="xl" ta="center" maw={500} fw={500}>
                {t('portal.notFound.subtitle')}
              </Text>
            </Stack>

            <Group mt="lg">
              <Button 
                size="lg" 
                variant="light" 
                color="brand" 
                radius="xl"
                leftSection={<IconHome size={22} />}
                onClick={() => navigate('/')}
              >
                {t('portal.notFound.backHome')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
