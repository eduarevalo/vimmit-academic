import React from 'react';
import { 
  Group, 
  Box, 
  Text, 
  Container, 
  UnstyledButton, 
  Button, 
  Burger,
  Drawer,
  Stack,
  rem
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

export interface PublicHeaderProps {
  logo?: React.ReactNode;
  links: { label: string; link: string; onClick?: () => void }[];
  onLogin?: () => void;
}

export const PublicHeader = ({ logo, links, onLogin }: PublicHeaderProps) => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 48em)');

  const mainLogo = logo || (
    <Group gap="xs">
      <Box w={30} h={30} bg="brand" style={{ borderRadius: 6 }} />
      <Text fw={800} size="xl" style={{ letterSpacing: -1 }}>Aseder</Text>
    </Group>
  );

  const desktopLinks = links.map((item) => (
    <UnstyledButton
      key={item.label}
      onClick={item.onClick}
      style={{
        fontSize: rem(14),
        fontWeight: 600,
        color: 'var(--mantine-color-gray-7)',
        padding: `${rem(8)} ${rem(12)}`,
        borderRadius: 'var(--mantine-radius-xs)',
        transition: 'all 0.2s ease',
      }}
      component="a"
      href={item.link}
    >
      {item.label}
    </UnstyledButton>
  ));

  const mobileLinks = links.map((item) => (
    <UnstyledButton
      key={item.label}
      onClick={() => { item.onClick?.(); close(); }}
      style={{
        padding: `${rem(12)} ${rem(16)}`,
        width: '100%',
        fontWeight: 600,
        fontSize: rem(16),
        borderBottom: '1px solid var(--mantine-color-gray-1)'
      }}
      component="a"
      href={item.link}
    >
      {item.label}
    </UnstyledButton>
  ));

  return (
    <Box 
      component="header" 
      h={70} 
      style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%">
          <Group>
            {isMobile && <Burger opened={opened} onClick={toggle} size="sm" />}
            {mainLogo}
          </Group>

          <Group gap={5} visibleFrom="sm">
            {desktopLinks}
          </Group>

          <Group>
            <Button 
              variant="light" 
              color="brand" 
              radius="xs" 
              onClick={onLogin}
            >
              Portal
            </Button>
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title={mainLogo}
        zIndex={2000}
      >
        <Stack gap="xs" mt="xl">
          {mobileLinks}
          <Button 
            fullWidth 
            mt="xl" 
            color="brand" 
            radius="xs" 
            onClick={() => { onLogin?.(); close(); }}
          >
            Ir al Portal
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
};
