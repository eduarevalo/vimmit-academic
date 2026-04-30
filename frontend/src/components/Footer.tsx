import { Container, Group, Box, Text, Stack } from '@mantine/core';
import { IconBrandFacebook, IconSchool } from '@tabler/icons-react';
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
    <Box component="footer" id="footer" mt={120} py={60} style={(theme) => ({ borderTop: `1px solid ${theme.colors.brand[1]}`, backgroundColor: '#ffffff' })}>
      <Container size="xl">
        <Group justify="space-between" align="flex-start" mb={40}>
          <Box style={{ maxWidth: 300 }}>
            <Group gap={8} mb="md">
              <img 
                src="/logo.jpg" 
                alt={t('common.logoAlt')} 
                style={{ 
                  height: 32, 
                  borderRadius: 'var(--mantine-radius-xs)' 
                }} 
              />
              <Text fw={900} size="xl" c="black" style={{ letterSpacing: -1 }}>{name}</Text>
            </Group>
            <Text size="sm" c="black" lh={1.6}>
              {description}
            </Text>
          </Box>
          <Group gap={80} align="flex-start">
            <Stack gap="sm">
              <Text fw={700} c="black">{t('footer.quickLinks')}</Text>
              <Text 
                component="a" 
                href="#" 
                onClick={(e) => { e.preventDefault(); openRegistration(); }} 
                size="sm" 
                c="black"
                style={{ cursor: 'pointer' }}
              >
                {t('header.admissions')}
              </Text>
              <Text component={Link} to="/programs" size="sm" c="black">{t('footer.links.technicalPrograms')}</Text>
              <Text component={Link} to="/campus" size="sm" c="black">{t('header.campus')}</Text>
              <Text component={Link} to="/about" size="sm" c="black">{t('header.about')}</Text>
              <Text component={Link} to="/impact" size="sm" c="black">{t('footer.links.socialImpact')}</Text>
            </Stack>
            <Stack gap="sm">
              <Text fw={700} c="black">{t('footer.contact')}</Text>
              <Text size="sm" c="black">{contact.address.street}</Text>
              <Text size="sm" c="black">{contact.address.city}, {contact.address.state} {contact.address.zip}</Text>
              <Text size="sm" c="black">{contact.phone}</Text>
              <Text component="a" href={`mailto:${contact.email}`} size="sm" c="black" fw={600}>{contact.email}</Text>
            </Stack>
          </Group>
        </Group>
        
        <Group justify="space-between" pt="md" style={(theme) => ({ borderTop: `1px solid ${theme.colors.brand[1]}` })}>
          <Text size="sm" c="black" fw={500}>© {new Date().getFullYear()} {fullName}. {t('footer.rights')}</Text>
          <Group gap="md">
            <Anchor href={socials.facebook} target="_blank"><IconBrandFacebook size={20} color="#000000" style={{ cursor: 'pointer' }}/></Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

