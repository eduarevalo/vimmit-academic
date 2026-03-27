import { Container, Group, Button, Text, Box, Menu, Avatar } from '@mantine/core';
import { IconExternalLink, IconLogout, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const { name } = useInstitution();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

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
            <img src="/logo-clean.png" alt={t('common.logoAlt')} style={{ height: 32, width: 'auto' }} />
            <Text size="xl" fw={900} variant="gradient" gradient={{ from: '#16884a', to: '#2b8a3e', deg: 45 }}>
              {name}
            </Text>
          </Group>

          <Group gap={30} visibleFrom="sm">
            <Text component={Link} to="/about" fw={500} c={isActive('/about') ? 'brand' : 'dimmed'}>{t('header.about')}</Text>
            <Text component={Link} to="/programs" fw={500} c={isActive('/programs') ? 'brand' : 'dimmed'}>{t('header.programs')}</Text>
            <Text component={Link} to="/campus" fw={500} c={isActive('/campus') ? 'brand' : 'dimmed'}>{t('header.campus')}</Text>
            <Text component={Link} to="/admissions" fw={500} c={isActive('/admissions') ? 'brand' : 'dimmed'}>{t('header.admissions')}</Text>
            <Text component={Link} to="/student-life" fw={500} c={isActive('/student-life') ? 'brand' : 'dimmed'}>{t('header.campusLife')}</Text>
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
