import { Container, Group, Button, Text, Box, Menu, Avatar, Burger, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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
  const [opened, { toggle, close }] = useDisclosure(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: t('header.about'), path: '/about' },
    { label: t('header.programs'), path: '/programs' },
    { label: t('header.campus'), path: '/campus' },
    { label: t('header.admissions'), path: '/admissions' },
    { label: t('header.campusLife'), path: '/student-life' },
  ];

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Text 
          key={link.path}
          component={Link} 
          to={link.path} 
          fw={500} 
          size={mobile ? 'lg' : 'sm'}
          c={isActive(link.path) ? 'brand' : 'dimmed'} 
          onClick={mobile ? close : undefined}
          style={{ 
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          className="nav-link"
        >
          {link.label}
        </Text>
      ))}
    </>
  );

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
            <NavContent />
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
                  <Menu.Label>{t('portal.header.accountLabel')}</Menu.Label>
                  <Menu.Item leftSection={<IconUser size={14} />}>{t('portal.header.profile')}</Menu.Item>
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

            <Burger 
              opened={opened} 
              onClick={toggle} 
              hiddenFrom="sm" 
              size="sm" 
              color="brand"
              aria-label="Toggle navigation"
            />
          </Group>
        </Group>

        <Drawer
          opened={opened}
          onClose={close}
          size="75%"
          padding="xl"
          title={
            <Group gap="xs">
              <img src="/logo-clean.png" alt={t('common.logoAlt')} style={{ height: 24 }} />
              <Text fw={700} size="lg">{name}</Text>
            </Group>
          }
          position="right"
          zIndex={1001}
        >
          <Stack gap="lg" mt="xl">
            <NavContent mobile />
            
            <Box style={{ borderTop: '1px solid #f1f3f5', paddingTop: '1.5rem' }}>
              <Button 
                component="a"
                href="/portal"
                target="_blank"
                radius="xl" 
                variant="light" 
                color="gray"
                fullWidth
                rightSection={<IconExternalLink size={16} />}
                mb="sm"
              >
                {t('header.educationalPortal')}
              </Button>

              {isAuthenticated && showUser ? (
                <Stack gap="sm">
                  <Text size="sm" fw={600} c="dimmed">{t('portal.header.accountLabel')}</Text>
                  <Button variant="subtle" color="gray" leftSection={<IconUser size={16} />} justify="flex-start" fullWidth>
                    {t('portal.header.profile')}
                  </Button>
                  <Button 
                    variant="subtle" 
                    color="red" 
                    leftSection={<IconLogout size={16} />} 
                    justify="flex-start" 
                    fullWidth 
                    onClick={() => {
                      logout();
                      close();
                    }}
                  >
                    {t('header.logout')}
                  </Button>
                </Stack>
              ) : showLogin && (
                <Button 
                  variant="outline" 
                  color="brand" 
                  radius="xl" 
                  fullWidth 
                  onClick={() => {
                    navigate('/portal/login');
                    close();
                  }}
                >
                  {t('auth.login')}
                </Button>
              )}
            </Box>
          </Stack>
        </Drawer>
      </Container>
    </Box>
  );
}
