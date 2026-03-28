import { Container, Title, Text, Stack, Box, SimpleGrid, Paper, ThemeIcon, useMantineTheme, Image, Overlay, Group, Skeleton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconStethoscope, IconDental, IconMedicineSyrup, IconBabyCarriage, IconUserCheck, IconMicroscope, IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInstitution } from '../hooks/useInstitution';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../config';

interface Program {
  id: string;
  name: string;
  description: string;
}

// Frontend metadata mapping for programs not fully configured in backend yet
const PROGRAM_METADATA: Record<string, any> = {
  'Auxiliar en Enfermería': { id: 'nursing', icon: IconStethoscope, color: 'blue', image: '/assets/programs/nursing.png' },
  'Auxiliar en Salud Oral': { id: 'oralHealth', icon: IconDental, color: 'teal', image: '/assets/programs/oral_health.png' },
  'Auxiliar en Servicios Farmacéuticos': { id: 'pharmacy', icon: IconMedicineSyrup, color: 'red', image: '/assets/programs/pharmacy.png' },
  'Auxiliar en Veterinaria': { id: 'veterinary', icon: IconStethoscope, color: 'green', image: '/assets/programs/veterinary.png' },
  'Técnico Laboral en Calidad y Procedimiento Aplicado a la Industria de Alimentos': { id: 'foodIndustry', icon: IconMicroscope, color: 'yellow', image: '/assets/programs/food_industry.png' },
  'Técnico en Atención Integral a la Primera Infancia': { id: 'earlyChildhood', icon: IconBabyCarriage, color: 'orange', image: '/assets/programs/early_childhood.png' },
  'Técnico en Seguridad y Salud en el Trabajo': { id: 'occupationalHealth', icon: IconUserCheck, color: 'gray', image: '/assets/programs/occupational_health.png' },
  'Técnico Laboral en Agente de Tránsito': { id: 'trafficAgent', icon: IconUserCheck, color: 'indigo', image: '/assets/programs/traffic_agent.png' },
};

const DEFAULT_METADATA = { icon: IconUserCheck, color: 'brand', image: '/assets/aseder_graduation.png' };

export function ProgramsPage() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const { slug } = useInstitution();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/academic/programs/public/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(t('common.error.fetchPrograms'));
        return res.json();
      })
      .then(setPrograms)
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const getMetadata = (name: string) => {
    return PROGRAM_METADATA[name] || DEFAULT_METADATA;
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        py="100px" 
        style={{ 
            position: 'relative', 
            backgroundImage: 'url(/assets/aseder_graduation.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            color: 'white'
        }}
      >
        <Overlay color="#000" opacity={0.6} zIndex={1} />
        <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
          <Stack gap="md" align="center" ta="center">
            <Title order={1} size={50} fw={900}>
              {t('technicalPage.title')}
            </Title>
            <Text size="xl" maw={700}>
              {t('technicalPage.subtitle')}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py={80}>
        <Stack gap={80}>
          {/* Clinic Highlight */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="50px">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Image 
                    src="/assets/aseder_medical.png" 
                    radius="lg" 
                    height={400}
                />
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Stack gap="xl" justify="center" h="100%">
                    <Group gap="xs">
                        <ThemeIcon size={50} radius="md" color="brand.6">
                            <IconMicroscope size={32} />
                        </ThemeIcon>
                        <Title order={2}>{t('technicalPage.clinic.title')}</Title>
                    </Group>
                    <Text size="lg" lh={1.8}>
                        {t('technicalPage.clinic.text')}
                    </Text>
                    <Text size="md" c="dimmed">
                        {t('technicalPage.clinic.secondaryText')}
                    </Text>
                </Stack>
            </motion.div>
          </SimpleGrid>

          {/* Programs Grid */}
          <Stack gap="xl">
            <Title order={2} ta="center" size={36}>{t('technicalPage.offersTitle')}</Title>
            
            {loading ? (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} h={300} radius="lg" />
                ))}
              </SimpleGrid>
            ) : error ? (
              <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
                <IconAlertCircle size={48} color="red" />
                <Text mt="md">{error}</Text>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
                  {programs.map((program, index) => {
                      const meta = getMetadata(program.name);
                      return (
                          <motion.div
                              key={program.id}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              viewport={{ once: true }}
                          >
                              <Paper 
                                  radius="lg" 
                                  withBorder 
                                  shadow="sm" 
                                  style={{ 
                                      height: '100%', 
                                      transition: 'all 0.3s ease',
                                      cursor: 'pointer',
                                      overflow: 'hidden',
                                      display: 'flex',
                                      flexDirection: 'column'
                                  }} 
                                  onClick={() => navigate(`/programs/${meta.id || program.id}`)}
                                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = theme.shadows.lg; }} 
                                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadows.sm; }}
                              >
                                  <Box h={160} style={{ position: 'relative' }}>
                                      <Image src={meta.image} h={160} w="100%" />
                                      <Overlay color="#000" opacity={0.2} zIndex={1} />
                                      <ThemeIcon 
                                          size="40px" 
                                          radius="md" 
                                          variant="filled" 
                                          color={meta.color} 
                                          style={{ position: 'absolute', bottom: -15, left: 20, zIndex: 2, boxShadow: theme.shadows.md }}
                                      >
                                          <meta.icon size={22} stroke={2} />
                                      </ThemeIcon>
                                  </Box>
                                  
                                  <Stack p="xl" pt="30px" gap="xs" style={{ flexGrow: 1 }}>
                                      <Title order={3} size="h5" fw={800}>{program.name}</Title>
                                      <Text size="sm" c="dimmed" lh={1.5} lineClamp={3}>
                                          {program.description}
                                      </Text>
                                      <Text fw={700} size="xs" c="brand.6" tt="uppercase" mt="auto">
                                          {t('technicalPage.viewDetail')} &rarr;
                                      </Text>
                                  </Stack>
                              </Paper>
                          </motion.div>
                      );
                  })}
              </SimpleGrid>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
