import React from 'react';
import { 
  AppShell, 
  Group, 
  Burger, 
  Text, 
  Avatar, 
  Menu, 
  UnstyledButton, 
  rem, 
  Box,
  Drawer,
  ScrollArea,
  ActionIcon
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { 
  IconSettings, 
  IconUser, 
  IconLogout, 
  IconBell 
} from '@tabler/icons-react';

export interface ShellProps {
  children: React.ReactNode;
  navbarContent?: React.ReactNode;
  asideContent?: React.ReactNode;
  logo?: React.ReactNode;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  variant?: 'app' | 'landing';
}

export const Shell = ({ 
  children, 
  navbarContent, 
  asideContent, 
  logo, 
  user,
  variant = 'app' 
}: ShellProps) => {
  const [navbarOpened, { toggle: toggleNavbar, close: closeNavbar }] = useDisclosure(false);
  const [asideOpened, { toggle: toggleAside, close: closeAside }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 48em)');

  const isApp = variant === 'app';

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
      styles={(theme) => ({
        main: {
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          paddingTop: 'calc(70px + var(--mantine-spacing-md))',
        },
        header: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${theme.colors.brand[2]}`,
          zIndex: 100,
        }
      })}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {isApp && navbarContent && (
              <Burger opened={navbarOpened} onClick={toggleNavbar} size="sm" />
            )}
            <Box style={{ cursor: 'pointer' }}>
              {logo || (
                <Group gap="xs">
                  <Box w={30} h={30} bg="brand" style={{ borderRadius: 'var(--mantine-radius-xs)' }} />
                  <Text fw={800} size="xl" style={{ letterSpacing: -1 }}>Aseder</Text>
                </Group>
              )}
            </Box>
          </Group>

          <Group gap="lg">
            {isApp && asideContent && (
              <ActionIcon 
                variant="subtle" 
                color="brand" 
                size="lg" 
                radius="xs"
                onClick={toggleAside}
              >
                <IconBell size={22} />
              </ActionIcon>
            )}

            {user && (
              <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap="xs">
                      <Avatar src={user.image} radius="xs" size="sm" color="brand">
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box visibleFrom="sm" style={{ textAlign: 'left' }}>
                        <Text size="sm" fw={500}>{user.name}</Text>
                        <Text size="xs" c="dimmed">{user.email}</Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Application</Menu.Label>
                  <Menu.Item leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}>
                    Profile
                  </Menu.Item>
                  <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                    Settings
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Label>Danger zone</Menu.Label>
                  <Menu.Item 
                    color="red" 
                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Overlapping Navigation Drawer */}
      <Drawer
        opened={navbarOpened}
        onClose={closeNavbar}
        size={280}
        title={<Text fw={700}>Navegación</Text>}
        padding="md"
        zIndex={1000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md" px="md">
          {navbarContent}
        </ScrollArea>
      </Drawer>

      {/* Overlapping Aside Drawer */}
      <Drawer
        opened={asideOpened}
        onClose={closeAside}
        position="right"
        size={340}
        title={<Text fw={700}>Notificaciones</Text>}
        padding="md"
        zIndex={1000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md" px="md">
          {asideContent}
        </ScrollArea>
      </Drawer>

      <AppShell.Main>
        <Box maw={variant === 'landing' ? 1200 : '100%'} mx="auto">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

Shell.displayName = 'Shell';
