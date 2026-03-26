import { Container, Group, Box, Text, Stack } from '@mantine/core';
import { IconBook2, IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';
import { useRegistrationModal } from '../hooks/useRegistrationModal';

export function Footer() {
  const { t } = useTranslation();
  const { name, fullName, description, contact, socials } = useInstitution();
  const { open: openRegistration } = useRegistrationModal();

  return (
    <Box id="footer" mt={120} py={60} style={{ borderTop: '1px solid #eaeaea', backgroundColor: '#ffffff' }}>
      <Container size="lg">
        <Group justify="space-between" align="flex-start" mb={40}>
          <Box style={{ maxWidth: 300 }}>
            <Group gap="xs" mb="md">
              <IconBook2 size={28} color="#12b886" />
              <Text fw={800} size="lg" c="dark.8">{name}</Text>
            </Group>
            <Text size="sm" c="dimmed" lh={1.6}>
              {description}
            </Text>
          </Box>
          <Group gap={80}>
            <Stack gap="sm">
              <Text fw={700} c="dark.8">{t('footer.quickLinks')}</Text>
              <Text 
                component="a" 
                href="#" 
                onClick={(e) => { e.preventDefault(); openRegistration(); }} 
                size="sm" 
                c="dimmed"
                style={{ cursor: 'pointer' }}
              >
                {t('header.admissions')}
              </Text>
              <Text component="a" href="#programs" size="sm" c="dimmed">{t('footer.academics')}</Text>
              <Text component="a" href="/info" size="sm" c="dimmed">{t('header.about')}</Text>
              <Text component="a" href="#" size="sm" c="dimmed">{t('footer.research')}</Text>
            </Stack>
            <Stack gap="sm">
              <Text fw={700} c="dark.8">{t('footer.contact')}</Text>
              <Text size="sm" c="dimmed">{contact.address.street}</Text>
              <Text size="sm" c="dimmed">{contact.address.city}, {contact.address.state} {contact.address.zip}</Text>
              <Text size="sm" c="dimmed">{contact.phone}</Text>
              <Text component="a" href={`mailto:${contact.email}`} size="sm" c="brand">{contact.email}</Text>
            </Stack>
          </Group>
        </Group>
        
        <Group justify="space-between" pt="md" style={{ borderTop: '1px solid #eaeaea' }}>
          <Text size="sm" c="dimmed">© {new Date().getFullYear()} {fullName}. {t('footer.rights')}</Text>
          <Group gap="md">
            <Anchor href={socials.twitter} target="_blank"><IconBrandTwitter size={20} color="#868e96" style={{ cursor: 'pointer' }}/></Anchor>
            <Anchor href={socials.youtube} target="_blank"><IconBrandYoutube size={20} color="#868e96" style={{ cursor: 'pointer' }}/></Anchor>
            <Anchor href={socials.instagram} target="_blank"><IconBrandInstagram size={20} color="#868e96" style={{ cursor: 'pointer' }}/></Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

// Helper component for socials if Anchor is not imported, but let's just use <a> or Anchor if available
import { Anchor } from '@mantine/core';
