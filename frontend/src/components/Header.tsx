import { Container, Group, Button, Text, Box, Menu, ActionIcon } from '@mantine/core';
import { IconBook2, IconLanguage } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';

interface HeaderProps {
  onStartJourney?: () => void;
}

export function Header({ onStartJourney }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { name } = useInstitution();

  return (
    <Box 
      component="header" 
      py="md" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f1f3f5'
      }}
    >
      <Container size="lg">
        <Group justify="space-between" h="100%">
          <Group gap="xs">
            <IconBook2 size={30} color="#16884a" />
            <Text size="xl" fw={900} variant="gradient" gradient={{ from: '#16884a', to: '#2b8a3e', deg: 45 }}>
              {name}
            </Text>
          </Group>

          <Group gap={30} visibleFrom="sm">
            <Text component="a" href="#" fw={500} c="dimmed">{t('header.about')}</Text>
            <Text component="a" href="#" fw={500} c="brand">{t('header.programs')}</Text>
            <Text component="a" href="#" fw={500} c="dimmed">{t('header.admissions')}</Text>
            <Text component="a" href="#" fw={500} c="dimmed">{t('header.campusLife')}</Text>
          </Group>

          <Group gap="sm">
            <Menu shadow="md" width={120}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
                  <IconLanguage size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => i18n.changeLanguage('es')}>Español</Menu.Item>
                <Menu.Item onClick={() => i18n.changeLanguage('en')}>English</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button radius="xl" variant="filled" color="brand" onClick={onStartJourney}>
              {t('header.startJourney')}
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
