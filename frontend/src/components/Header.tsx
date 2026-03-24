import { Container, Group, Button, Text, Box } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';

export function Header() {
  const { t } = useTranslation();
  const { name } = useInstitution();

  return (
    <Box component="header" py="md" bg="white" style={{ borderBottom: '1px solid #eaeaea', position: 'sticky', top: 0, zIndex: 100 }}>
      <Container size="lg">
        <Group justify="space-between">
          <Group gap="sm" style={{ cursor: 'pointer' }}>
            <IconBook2 size={32} color="#12b886" />
            <Text fw={800} size="xl" c="dark.8" lts={-0.5}>
              {name}
            </Text>
          </Group>
          <Group gap="lg" visibleFrom="sm">
            <Text component="a" href="#" fw={500} c="dimmed" style={{ transition: 'color 0.2s' }}>{t('header.about')}</Text>
            <Text component="a" href="#" fw={600} c="brand">{t('header.programs')}</Text>
            <Text component="a" href="#" fw={500} c="dimmed">{t('header.admissions')}</Text>
            <Text component="a" href="#" fw={500} c="dimmed">{t('header.campusLife')}</Text>
          </Group>
          <Button radius="xl" variant="filled" color="brand">
            {t('header.startJourney')}
          </Button>
        </Group>
      </Container>
    </Box>
  );
}
