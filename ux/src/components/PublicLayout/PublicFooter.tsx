import React from 'react';
import { 
  Box, 
  Container, 
  Group, 
  Text, 
  Stack, 
  SimpleGrid, 
  UnstyledButton,
  Divider,
  rem
} from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandLinkedin } from '@tabler/icons-react';

export interface PublicFooterProps {
  logo?: React.ReactNode;
  sections: {
    title: string;
    links: { label: string; link: string }[];
  }[];
}

export const PublicFooter = ({ logo, sections }: PublicFooterProps) => {
  const mainLogo = logo || (
    <Group gap="xs">
      <Box w={30} h={30} bg="brand" style={{ borderRadius: 6 }} />
      <Text fw={800} size="xl" style={{ letterSpacing: -1 }}>Aseder</Text>
    </Group>
  );

  return (
    <Box 
      component="footer" 
      pt={80} 
      pb={40} 
      style={{ 
        backgroundColor: 'var(--mantine-color-gray-0)', 
        borderTop: '1px solid var(--mantine-color-gray-2)' 
      }}
    >
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={40}>
          <Stack gap="md">
            {mainLogo}
            <Text size="sm" c="dimmed" style={{ maxWidth: rem(260) }}>
              Potenciando la educación superior con tecnología de vanguardia y gestión académica integral.
            </Text>
            <Group gap="sm">
              <UnstyledButton><IconBrandFacebook size={20} color="var(--mantine-color-gray-6)" /></UnstyledButton>
              <UnstyledButton><IconBrandInstagram size={20} color="var(--mantine-color-gray-6)" /></UnstyledButton>
              <UnstyledButton><IconBrandTwitter size={20} color="var(--mantine-color-gray-6)" /></UnstyledButton>
              <UnstyledButton><IconBrandLinkedin size={20} color="var(--mantine-color-gray-6)" /></UnstyledButton>
            </Group>
          </Stack>

          {sections.map((section) => (
            <Stack key={section.title} gap="sm">
              <Text fw={700} size="sm" tt="uppercase" style={{ letterSpacing: rem(1) }}>
                {section.title}
              </Text>
              {section.links.map((link) => (
                <UnstyledButton
                  key={link.label}
                  component="a"
                  href={link.link}
                  style={{
                    fontSize: rem(14),
                    color: 'var(--mantine-color-gray-6)',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {link.label}
                </UnstyledButton>
              ))}
            </Stack>
          ))}
        </SimpleGrid>

        <Divider mt={60} mb={30} color="gray.2" />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} Aseder. Todos los derechos reservados.
          </Text>
          <Group gap="xl">
            <Text size="xs" c="dimmed" component="a" href="#">Privacidad</Text>
            <Text size="xs" c="dimmed" component="a" href="#">Términos</Text>
            <Text size="xs" c="dimmed" component="a" href="#">Cookies</Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};
