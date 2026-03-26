import { Container, Title, SimpleGrid, Card, Text, Center, Anchor, Skeleton } from '@mantine/core';
import { IconCode, IconTrophy, IconLeaf, IconPalette, IconStethoscope, IconBuildingStore } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useInstitution } from '../hooks/useInstitution';

const API_BASE_URL = 'http://localhost:8000';

interface Program {
  id: string;
  name: string;
  description: string;
}

const UI_CONFIGS = [
  { icon: IconStethoscope, color: 'red' },
  { icon: IconCode, color: 'brand' },
  { icon: IconBuildingStore, color: 'blue' },
  { icon: IconPalette, color: 'grape' },
  { icon: IconLeaf, color: 'green' },
  { icon: IconTrophy, color: 'orange' },
];

export function ProgramsSection() {
  const { t } = useTranslation();
  const { slug } = useInstitution();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/academic/programs/public/${slug}`)
      .then((res) => res.json())
      .then(setPrograms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Container size="lg" py={80} id="programs">
        <Title order={2} ta="center" mb={50} fw={800} size="h1" c="dark.8">
          {t('programs.title')}
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} h={300} radius="lg" />
          ))}
        </SimpleGrid>
      </Container>
    );
  }

  if (programs.length === 0) {
    return null;
  }

  return (
    <Container size="lg" py={80} id="programs">
      <Title order={2} ta="center" mb={50} fw={800} size="h1" c="dark.8">
        {t('programs.title')}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {programs.map((prog, index) => {
          const config = UI_CONFIGS[index % UI_CONFIGS.length];
          const Icon = config.icon;
          return (
            <Card key={prog.id} padding="xl" radius="lg" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #f1f3f5', transition: 'transform 0.2s', cursor: 'pointer' }} 
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Center bg={`${config.color}.0`} w={60} h={60} style={{ borderRadius: '12px', marginBottom: '1.5rem' }}>
                <Icon size={32} color={`var(--mantine-color-${config.color}-6)`} stroke={1.5} />
              </Center>
              <Title order={3} size="h4" fw={700} mb="xs">{prog.name}</Title>
              <Text c="dimmed" lh={1.6} mb="lg" style={{ flexGrow: 1 }}>{prog.description}</Text>
              <Anchor href="#" fw={600} size="sm" c="brand">
                {t('programs.learnMore')}
              </Anchor>
            </Card>
          );
        })}
      </SimpleGrid>
    </Container>
  );
}
