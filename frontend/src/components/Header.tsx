import { Container, Group, Button, Text, Box, Menu, Avatar } from '@mantine/core';
import { IconBook2, IconExternalLink, IconLogout, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onStartJourney?: () => void;
  onLogoClick?: () => void;
  showLogin?: boolean;
  showUser?: boolean;
}

export function Header({ 
  onStartJourney, 
  onLogoClick, 
  showLogin = false,
  showUser = false
}: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { name } = useInstitution();
  const { isAuthenticated, user, logout } = useAuth();

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
          <Group gap="xs" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
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
            <Button 
              component="a"
              href="/portal"
              target="_blank"
              radius="xl" 
              variant="subtle" 
              color="gray"
              rightSection={<IconExternalLink size={16} />}
              visibleFrom="sm"
            >
              {t('header.educationalPortal')}
            </Button>
            
            {isAuthenticated && showUser ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Button variant="subtle" color="gray" radius="xl" px={8}>
                    <Group gap={8}>
                      <Avatar size={24} color="brand" radius="xl">
                        {user?.email?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Text size="sm" fw={500} visibleFrom="xs">{user?.email?.split('@')[0]}</Text>
                    </Group>
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Cuenta</Menu.Label>
                  <Menu.Item leftSection={<IconUser size={14} />}>Mi Perfil</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    color="red" 
                    leftSection={<IconLogout size={14} />}
                    onClick={logout}
                  >
                    {t('header.logout')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : showLogin && (
              <Button variant="subtle" color="brand" radius="xl" onClick={() => navigate('/portal/login')}>
                {t('auth.login')}
              </Button>
            )}

            <Button radius="xl" variant="filled" color="brand" onClick={onStartJourney}>
              {t('header.startJourney')}
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
