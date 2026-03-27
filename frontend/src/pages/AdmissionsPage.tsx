import { Stack, Text, Container, Title, List, ThemeIcon, Button, Group } from '@mantine/core';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRegistrationModal } from '../hooks/useRegistrationModal';

export function AdmissionsPage() {
  const { t } = useTranslation();
  const { open } = useRegistrationModal();

  return (
    <Container size="lg" py={80}>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1} size="42px" fw={900}>{t('admissionsPage.title')}</Title>
          <Text size="xl" c="dimmed">{t('admissionsPage.subtitle')}</Text>
        </Stack>

        <Stack gap="lg">
          <Title order={2}>{t('admissionsPage.requirements.title')}</Title>
          <List
            spacing="md"
            size="lg"
            center
            icon={
              <ThemeIcon color="brand" size={24} radius="xl">
                <IconCheck size={16} />
              </ThemeIcon>
            }
          >
            <List.Item>{t('admissionsPage.requirements.item1')}</List.Item>
            <List.Item>{t('admissionsPage.requirements.item2')}</List.Item>
            <List.Item>{t('admissionsPage.requirements.item3')}</List.Item>
            <List.Item>{t('admissionsPage.requirements.item4')}</List.Item>
          </List>
        </Stack>

        <Stack gap="lg" mt={40}>
          <Title order={2}>{t('admissionsPage.process.title')}</Title>
          <Stack gap="md">
            {[1, 2, 3, 4].map((step) => (
              <Group key={step} wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" size={40} radius="md" color="brand">
                  <Text fw={700}>{step}</Text>
                </ThemeIcon>
                <Text size="lg">{t(`admissionsPage.process.step${step}`)}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>

        <Group mt={50} p="xl" style={{ backgroundColor: '#f8f9fa', borderRadius: 16 }}>
          <IconInfoCircle size={40} color="#16884a" />
          <Stack gap={0} style={{ flex: 1 }}>
            <Text fw={700} size="lg">{t('admissionsPage.cta.title')}</Text>
            <Text c="dimmed">{t('admissionsPage.cta.text')}</Text>
          </Stack>
          <Button size="lg" radius="xl" color="brand" onClick={open}>
            {t('registration.submit')}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
