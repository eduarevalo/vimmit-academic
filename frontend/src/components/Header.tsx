import { Container, Group, Button, Text, Box, Menu, Avatar, Burger, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconExternalLink, IconLogout, IconUser, IconSchool } from '@tabler/icons-react';
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
        backgroundColor: '#fff', 
        borderBottom: `1px solid var(--mantine-color-brand-2)`
      }}
    >
      <Container size="xl">
        <Group justify="space-between" h="100%">
          <Group gap={8} onClick={onLogoClick} style={{ cursor: 'pointer' }}>
            <img 
              src="/logo.jpg" 
              alt={t('common.logoAlt')} 
              style={{ 
                height: 32, 
                borderRadius: 'var(--mantine-radius-xs)' 
              }} 
            />
            <Text size="xl" fw={900} c="brand" style={{ letterSpacing: -1 }}>
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
              radius="xs" 
              variant="subtle" 
              color="secondary"
              rightSection={<IconExternalLink size={16} />}
              visibleFrom="sm"
            >
              {t('header.educationalPortal')}
            </Button>
            
            {isAuthenticated && showUser ? (
              <Menu shadow="md" width={200} position="bottom-end" radius="xs">
                <Menu.Target>
                  <Button variant="subtle" color="gray" radius="xs" px={8}>
                    <Group gap={8}>
                      <Avatar size={24} color="brand" radius="xs">
                        {user?.email?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Text size="sm" fw={600} visibleFrom="xs">{user?.email?.split('@')[0]}</Text>
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
              <Button variant="subtle" color="brand" radius="xs" onClick={() => navigate('/portal/login')}>
                {t('auth.login')}
              </Button>
            )}

            <Button radius="xs" variant="filled" color="brand" onClick={onStartJourney}>
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
              <img src="/logo.jpg" alt={t('common.logoAlt')} style={{ height: 24 }} />
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
                radius="xs" 
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
                  radius="xs" 
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
