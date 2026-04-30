import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  HeroSection, 
  NarrativeBlock,
  Button as VimmitButton
} from '@ux/index';
import { 
  IconStethoscope, 
  IconDental, 
  IconMedicineSyrup, 
  IconBabyCarriage, 
  IconUserCheck, 
  IconMicroscope, 
  IconAlertCircle,
  IconArrowRight,
  IconClock,
  IconMapPin
} from '@tabler/icons-react';
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
  useMantineTheme
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useInstitution } from '../hooks/useInstitution';
import { API_BASE_URL } from '../config';

interface Program {
  id: string;
  name: string;
  description: string;
}

const PROGRAM_METADATA: Record<string, any> = {
  'Auxiliar en Enfermería': { id: 'nursing', color: 'blue', image: '/assets/programs/nursing.png' },
  'Auxiliar en Salud Oral': { id: 'oralHealth', color: 'teal', image: '/assets/programs/oral_health.png' },
  'Auxiliar en Servicios Farmacéuticos': { id: 'pharmacy', color: 'red', image: '/assets/programs/pharmacy.png' },
  'Auxiliar en Veterinaria': { id: 'veterinary', color: 'green', image: '/assets/programs/veterinary.png' },
  'Técnico Laboral en Calidad y Procedimiento Aplicado a la Industria de Alimentos': { id: 'foodIndustry', color: 'yellow', image: '/assets/programs/food_industry.png' },
  'Técnico en Atención Integral a la Primera Infancia': { id: 'earlyChildhood', color: 'orange', image: '/assets/programs/early_childhood.png' },
  'Técnico en Seguridad y Salud en el Trabajo': { id: 'occupationalHealth', color: 'gray', image: '/assets/programs/occupational_health.png' },
  'Técnico Laboral en Agente de Tránsito': { id: 'trafficAgent', color: 'indigo', image: '/assets/programs/traffic_agent.png' },
};

const DEFAULT_METADATA = { color: 'brand', image: '/assets/aseder_graduation.png' };

export function ProgramsPage() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const { slug } = useInstitution();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/academic/programs/public/${slug}`)
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
  }, [slug, t]);

  const getMetadata = (name: string) => {
    const normalizedName = name.trim();
    // Case-insensitive lookup
    const key = Object.keys(PROGRAM_METADATA).find(
      k => k.toLowerCase() === normalizedName.toLowerCase()
    );
    return (key ? PROGRAM_METADATA[key] : null) || DEFAULT_METADATA;
  };

  return (
    <>
      <HeroSection 
        title={t('technicalPage.title')}
        subtitle={t('technicalPage.subtitle')}
        image="/assets/aseder_graduation.png"
      />

      <NarrativeBlock 
        title={t('technicalPage.clinic.title')}
        image="/assets/aseder_medical.png"
        imagePosition="right"
        description={
          <Stack gap="md">
            <Text size="lg" lh={1.8}>{t('technicalPage.clinic.text')}</Text>
            <Text c="dimmed">{t('technicalPage.clinic.secondaryText')}</Text>
          </Stack>
        }
      />

      <Container size="xl" py={80}>
        <Stack gap="xl">
          <Title order={2} ta="center" size={36} mb="xl">{t('technicalPage.offersTitle')}</Title>
          
          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} h={350} radius="xs" />
              ))}
            </SimpleGrid>
          ) : error ? (
            <Paper p="xl" radius="xs" withBorder style={{ textAlign: 'center' }}>
              <IconAlertCircle size={48} color="red" />
              <Text mt="md">{error}</Text>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
              {programs.map((program, index) => {
                const meta = getMetadata(program.name);
                return (
                  <Paper 
                    key={program.id}
                    radius="xs" 
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
                  >
                    <AspectRatio ratio={16/9}>
                      <Image 
                        src={meta.image} 
                        alt={program.name} 
                        style={{ objectFit: 'cover' }}
                      />
                    </AspectRatio>
                    
                    <Stack p="xl" gap="md" style={{ flexGrow: 1 }}>
                      <Badge color={meta.color} variant="light" radius="xs" size="sm">Técnico Laboral</Badge>
                      <Title order={3} size="h5" fw={800} style={{ minHeight: '3em' }}>{program.name}</Title>
                      <Text size="sm" c="dimmed" lh={1.5} lineClamp={3}>
                        {program.description}
                      </Text>
                      <Group justify="space-between" mt="auto" pt="md">
                        <Text fw={700} size="xs" c="brand.6" tt="uppercase">
                          {t('technicalPage.viewDetail')}
                        </Text>
                        <IconArrowRight size={16} color="var(--mantine-color-brand-6)" />
                      </Group>
                    </Stack>
                  </Paper>
                );
              })}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </>
  );
}
