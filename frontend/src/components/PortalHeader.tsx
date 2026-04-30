import { Container, Group, Text, Box, Menu, Avatar, Burger, rem } from '@mantine/core';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

interface PortalHeaderProps {
  navOpened?: boolean;
  onNavToggle?: () => void;
}

export function PortalHeader({ navOpened, onNavToggle }: PortalHeaderProps) {
  const { t } = useTranslation();
  const { name } = useInstitution();
  const { user, logout, setLogoutMessage } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setLogoutMessage('auth.logoutSuccess');
    logout();
    navigate('/portal');
  };

  return (
    <Box
      component="header"
      py={rem(12)}
      style={(theme) => ({
        backgroundColor: '#fff',
        borderBottom: `1px solid ${theme.colors.brand[2]}`,
        zIndex: 100,
        position: 'sticky',
        top: 0
      })}
    >
      <Container size="xl">
        <Group justify="space-between">
          <Group gap="sm">
            {/* Hamburger — mobile only */}
            {onNavToggle && (
              <Burger
                opened={navOpened ?? false}
                onClick={onNavToggle}
                hiddenFrom="sm"
                size="sm"
                aria-label={t('portal.header.toggleNav')}
              />
            )}
            <Link to="/portal" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="xs" style={{ cursor: 'pointer' }}>
                <img 
                  src="/logo.jpg" 
                  alt={t('common.logoAlt')} 
                  style={{ 
                    height: 24, 
                    borderRadius: 'var(--mantine-radius-xs)' 
                  }} 
                />
                <Text size="lg" fw={800} c="brand" style={{ letterSpacing: -0.5 }}>
                  {name}
                </Text>
              </Group>
            </Link>
          </Group>

          <Group gap="sm">
            <Menu shadow="md" width={200} position="bottom-end" radius="xs">
              <Menu.Target>
                <Box style={{ cursor: 'pointer' }}>
                  <Group gap={8}>
                    <Avatar src={user?.avatar_url} size={30} color="brand" radius="xs">
                      {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="xs" fw={700} visibleFrom="xs" c="brand.8">
                      {user?.first_name ? `${user.first_name}` : user?.email?.split('@')[0]}
                    </Text>
                  </Group>
                </Box>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t('portal.header.accountLabel')}</Menu.Label>
                <Menu.Item 
                  component={Link} 
                  to="/portal/profile" 
                  leftSection={<IconUser size={14} />}
                >
                  {t('portal.header.profile')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                >
                  {t('auth.logout')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
