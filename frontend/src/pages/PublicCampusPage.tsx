import { Container, Title, Text, Stack, Box, SimpleGrid, Paper, ThemeIcon, Badge, Group, Skeleton, Overlay } from '@mantine/core';
import { IconMapPin, IconBuilding, IconPhone, IconMail } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useInstitution } from '../hooks/useInstitution';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8000';

interface Campus {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
}

const CAMPUS_COLORS = ['brand', 'blue', 'teal', 'grape', 'orange', 'red'];

export function PublicCampusPage() {
  const { t } = useTranslation();
  const { slug, contact } = useInstitution();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/organization/campuses/public/${slug}`)
      .then((res) => res.json())
      .then(setCampuses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        py="100px" 
        style={{ 
          position: 'relative', 
          background: 'linear-gradient(135deg, #1a472a 0%, #16884a 50%, #2b8a3e 100%)',
          color: 'white'
        }}
      >
        <Overlay color="#000" opacity={0.15} zIndex={1} />
        <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
          <Stack gap="md" align="center" ta="center">
            <Badge variant="light" color="white" size="lg" radius="xl" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              {t('publicCampusPage.badge')}
            </Badge>
            <Title order={1} size={50} fw={900}>
              {t('publicCampusPage.title')}
            </Title>
            <Text size="xl" maw={700} style={{ opacity: 0.9 }}>
              {t('publicCampusPage.subtitle')}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py={80}>
        <Stack gap={60}>
          {/* Campus Cards */}
          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={300} radius="lg" />
              ))}
            </SimpleGrid>
          ) : campuses.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: campuses.length < 3 ? 2 : 3 }} spacing="xl">
              {campuses.map((campus, index) => {
                const color = CAMPUS_COLORS[index % CAMPUS_COLORS.length];
                return (
                  <motion.div
                    key={campus.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Paper 
                      p="xl" 
                      radius="lg" 
                      withBorder 
                      shadow="sm" 
                      style={{ 
                        height: '100%', 
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.transform = 'translateY(-8px)'; 
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.transform = 'translateY(0)'; 
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      {/* Top accent bar */}
                      <Box 
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          right: 0, 
                          height: 4, 
                          background: `var(--mantine-color-${color}-6)` 
                        }} 
                      />

                      <Stack gap="lg" mt="xs">
                        <Group>
                          <ThemeIcon size={50} radius="md" variant="light" color={color}>
                            <IconBuilding size={28} stroke={1.5} />
                          </ThemeIcon>
                          <Stack gap={2} style={{ flex: 1 }}>
                            <Title order={3} size="h4" fw={700}>{campus.name}</Title>
                            <Badge variant="outline" color="gray" size="sm">{campus.code}</Badge>
                          </Stack>
                        </Group>

                        <Stack gap="xs">
                          {campus.city && (
                            <Group gap="xs" wrap="nowrap">
                              <IconMapPin size={16} color="var(--mantine-color-dimmed)" stroke={1.5} />
                              <Text size="sm" c="dimmed">
                                {campus.city}{campus.country ? `, ${campus.country}` : ''}
                              </Text>
                            </Group>
                          )}
                          {campus.address && (
                            <Group gap="xs" wrap="nowrap">
                              <IconBuilding size={16} color="var(--mantine-color-dimmed)" stroke={1.5} />
                              <Text size="sm" c="dimmed">{campus.address}</Text>
                            </Group>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  </motion.div>
                );
              })}
            </SimpleGrid>
          ) : (
            <Paper withBorder p="xl" radius="lg" ta="center">
              <Text c="dimmed" size="lg">{t('publicCampusPage.empty')}</Text>
            </Paper>
          )}

          {/* Contact Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Paper 
              p="xl" 
              radius="lg" 
              style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid #dee2e6'
              }}
            >
              <Stack gap="lg" align="center" ta="center">
                <Title order={2} size="h3" fw={700}>{t('publicCampusPage.contact.title')}</Title>
                <Text size="md" c="dimmed" maw={600}>
                  {t('publicCampusPage.contact.subtitle')}
                </Text>
                <Group gap="xl" mt="md" justify="center">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="brand" size="lg" radius="md">
                      <IconPhone size={18} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>{contact.phone}</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="brand" size="lg" radius="md">
                      <IconMail size={18} />
                    </ThemeIcon>
                    <Text component="a" href={`mailto:${contact.email}`} size="sm" fw={500} c="brand">
                      {contact.email}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="brand" size="lg" radius="md">
                      <IconMapPin size={18} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>
                      {contact.address.city}, {contact.address.state}
                    </Text>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
}
