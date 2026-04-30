import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HeroSection, Button as VimmitButton } from '@ux/index';
import { IconMapPin, IconBuilding, IconPhone, IconMail } from '@tabler/icons-react';
import { 
  Container, 
  SimpleGrid, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Box, 
  Skeleton, 
  AspectRatio, 
  Image, 
  Badge, 
  Group,
  ThemeIcon,
  Divider
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useInstitution } from '../hooks/useInstitution';
import { API_BASE_URL } from '../config';

interface Campus {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
}

const CAMPUS_IMAGES: Record<string, string> = {
  'QUILICHAO': '/assets/campuses/santander.png',
  'BUGA': '/assets/campuses/bugalagrande.png',
  'CAICE': '/assets/campuses/caicedonia.png',
};

const DEFAULT_CAMPUS_IMAGE = '/assets/campuses/santander.png';

export function PublicCampusPage() {
  const { t } = useTranslation();
  const { slug, contact } = useInstitution();
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/organization/campuses/public/${slug}`)
      .then((res) => res.json())
      .then(setCampuses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <HeroSection 
        title={t('publicCampusPage.title')}
        subtitle={t('publicCampusPage.subtitle')}
        image="/assets/campuses/santander.png"
      />

      <Container size="xl" py={80}>
        <Stack gap={80}>
          {loading ? (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {[1, 2].map((i) => (
                <Skeleton key={i} h={400} radius="xs" />
              ))}
            </SimpleGrid>
          ) : campuses.length > 0 ? (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
              {campuses.map((campus, index) => (
                <Paper key={campus.id} radius="xs" withBorder shadow="sm" overflow="hidden">
                  <Group wrap="nowrap" align="stretch" gap={0}>
                    <Box visibleFrom="sm" style={{ flex: 1 }}>
                      <Image 
                        h="100%" 
                        src={CAMPUS_IMAGES[campus.code] || DEFAULT_CAMPUS_IMAGE} 
                        alt={campus.name} 
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                    <Stack p="xl" style={{ flex: 1.2 }} gap="md">
                      <Badge color="brand" variant="light" radius="xs">{campus.code}</Badge>
                      <Title order={3} size="h4">{campus.name}</Title>
                      
                      <Stack gap="xs" mt="sm">
                        <Group gap="xs" wrap="nowrap">
                          <IconMapPin size={16} color="var(--mantine-color-brand-6)" />
                          <Text size="sm">{campus.city}{campus.country ? `, ${campus.country}` : ''}</Text>
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                          <IconBuilding size={16} color="var(--mantine-color-gray-5)" />
                          <Text size="xs" c="dimmed">{campus.address}</Text>
                        </Group>
                      </Stack>

                      <Divider mt="auto" />
                      <VimmitButton variant="light" color="secondary" radius="xs" fullWidth rightSection={<IconMapPin size={16} />}>
                        Ver Mapa y Sedes
                      </VimmitButton>
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          ) : (
            <Paper withBorder p="xl" radius="xs" ta="center" bg="gray.0">
              <Text c="dimmed" size="lg">{t('publicCampusPage.empty')}</Text>
            </Paper>
          )}

          {/* Institutional Contact Card */}
          <Paper p="xl" radius="xs" withBorder bg="brand.0" style={{ borderLeft: '6px solid var(--mantine-color-brand-6)' }}>
            <Stack gap="lg" align="center" ta="center" py="xl">
              <Title order={2} size="h3">{t('publicCampusPage.contact.title')}</Title>
              <Text size="md" c="dimmed" maw={600}>
                {t('publicCampusPage.contact.subtitle')}
              </Text>
              <Group gap="xl" mt="md" justify="center">
                <Group gap="xs">
                  <ThemeIcon variant="white" color="brand" size="lg" radius="xs" shadow="xs">
                    <IconPhone size={18} />
                  </ThemeIcon>
                  <Text size="sm" fw={700}>{contact.phone}</Text>
                </Group>
                <Group gap="xs">
                  <ThemeIcon variant="white" color="brand" size="lg" radius="xs" shadow="xs">
                    <IconMail size={18} />
                  </ThemeIcon>
                  <Text component="a" href={`mailto:${contact.email}`} size="sm" fw={700} c="brand">
                    {contact.email}
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}

