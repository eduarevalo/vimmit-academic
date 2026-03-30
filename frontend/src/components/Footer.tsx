import { Container, Group, Box, Text, Stack } from '@mantine/core';
import { IconBrandFacebook } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';
import { useRegistrationModal } from '../hooks/useRegistrationModal';
import { Link } from 'react-router-dom';
import { Anchor } from '@mantine/core';

export function Footer() {
  const { t } = useTranslation();
  const { name, fullName, description, contact, socials } = useInstitution();
  const { open: openRegistration } = useRegistrationModal();

  return (
    <Box component="footer" id="footer" mt={120} py={60} style={{ borderTop: '1px solid #eaeaea', backgroundColor: '#ffffff' }}>
      <Container size="lg">
        <Group justify="space-between" align="flex-start" mb={40}>
          <Box style={{ maxWidth: 300 }}>
            <Group gap="xs" mb="md">
              <img src="/logo-clean.png" alt={t('common.logoAlt')} style={{ height: 32, width: 'auto' }} />
              <Text fw={800} size="lg" c="dark.8">{name}</Text>
            </Group>
            <Text size="sm" c="dimmed" lh={1.6}>
              {description}
            </Text>
          </Box>
          <Group gap={80} align="flex-start">
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
              <Text component={Link} to="/programs" size="sm" c="dimmed">{t('footer.links.technicalPrograms')}</Text>
              <Text component={Link} to="/campus" size="sm" c="dimmed">{t('header.campus')}</Text>
              <Text component={Link} to="/about" size="sm" c="dimmed">{t('header.about')}</Text>
              <Text component={Link} to="/impact" size="sm" c="dimmed">{t('footer.links.socialImpact')}</Text>
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
            <Anchor href={socials.facebook} target="_blank"><IconBrandFacebook size={20} color="#868e96" style={{ cursor: 'pointer' }}/></Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

