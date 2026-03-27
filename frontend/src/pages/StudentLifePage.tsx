import { Stack, Text, Container, Title, Grid, Card, ThemeIcon } from '@mantine/core';
import { IconMapPin, IconUsers, IconCertificate } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function StudentLifePage() {
  const { t } = useTranslation();

  return (
    <Stack gap="xl" py={80}>
      <Container size="lg">
        <Stack align="center" gap="md" mb={50}>
          <Title order={1} size="h1" fw={900}>{t('studentLifePage.title')}</Title>
          <Text size="xl" c="dimmed" ta="center" style={{ maxWidth: 800 }}>
            {t('studentLifePage.subtitle')}
          </Text>
        </Stack>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card padding="xl" radius="md" withBorder>
              <Stack gap="md">
                <ThemeIcon size={50} radius="xl" color="brand" variant="light">
                  <IconMapPin size={30} />
                </ThemeIcon>
                <Title order={2}>{t('studentLifePage.campus.title')}</Title>
                <Text size="lg">{t('studentLifePage.campus.p1')}</Text>
                <Text size="lg">{t('studentLifePage.campus.p2')}</Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card padding="xl" radius="md" withBorder>
              <Stack gap="md">
                <ThemeIcon size={50} radius="xl" color="blue" variant="light">
                  <IconUsers size={30} />
                </ThemeIcon>
                <Title order={2}>{t('studentLifePage.impact.title')}</Title>
                <Text size="lg">{t('studentLifePage.impact.p1')}</Text>
                <Text size="lg">{t('studentLifePage.impact.p2')}</Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Stack align="center" mt={80} gap="xl">
          <Title order={2} ta="center">{t('studentLifePage.leaders.title')}</Title>
          <Grid gutter="xl">
            {[
              { icon: IconCertificate, label: t('studentLifePage.leaders.item1') },
              { icon: IconUsers, label: t('studentLifePage.leaders.item2') },
              { icon: IconMapPin, label: t('studentLifePage.leaders.item3') }
            ].map((item, idx) => (
              <Grid.Col key={idx} span={{ base: 12, sm: 4 }}>
                <Stack align="center" gap="sm">
                  <ThemeIcon size={60} radius="xl" variant="outline" color="brand">
                    <item.icon size={32} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">{item.label}</Text>
                </Stack>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Stack>
  );
}
