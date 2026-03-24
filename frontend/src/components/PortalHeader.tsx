import { Container, Group, Button, Text, Box, Menu, Avatar } from '@mantine/core';
import { IconBook2, IconLogout, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';
import { useAuth } from '../hooks/useAuth';

export function PortalHeader() {
  const { t } = useTranslation();
  const { name } = useInstitution();
  const { user, logout } = useAuth();

  return (
    <Box 
      component="header" 
      py="xs" 
      style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #f1f3f5'
      }}
    >
      <Container size="lg">
        <Group justify="space-between">
          <Group gap="md">
            <Group gap="xs">
              <IconBook2 size={24} color="#16884a" />
              <Text size="lg" fw={800} color="brand">
                {name} <Text span fw={400} c="dimmed" size="xs">| {t('portal.header.tag')}</Text>
              </Text>
            </Group>
          </Group>

          <Group gap="sm">
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button variant="light" color="brand" radius="xl" px={10} size="sm">
                  <Group gap={8}>
                    <Avatar size={24} color="brand" radius="xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="xs" fw={600} visibleFrom="xs">{user?.email?.split('@')[0]}</Text>
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
