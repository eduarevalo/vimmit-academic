import { Container, Group, Text, Box, Menu, Avatar, Burger } from '@mantine/core';
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
      py="xs"
      style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #f1f3f5',
      }}
    >
      <Container size="lg">
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
                <img src="/logo-clean.png" alt="Vimmit Logo" style={{ height: 28, width: 'auto' }} />
                <Text size="lg" fw={800} c="brand">
                  {name} <Text span fw={400} c="dimmed" size="xs">| {t('portal.header.tag')}</Text>
                </Text>
              </Group>
            </Link>
          </Group>

          <Group gap="sm">
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Box style={{ cursor: 'pointer' }}>
                  <Group gap={8}>
                    <Avatar size={30} color="brand" radius="xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="xs" fw={600} visibleFrom="xs">{user?.email?.split('@')[0]}</Text>
                  </Group>
                </Box>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t('portal.header.accountLabel')}</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>{t('portal.header.profile')}</Menu.Item>
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
