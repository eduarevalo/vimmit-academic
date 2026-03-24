import { Container, Title, SimpleGrid, Card, Text, Center, Anchor } from '@mantine/core';
import { IconCode, IconTrophy, IconLeaf, IconPalette, IconStethoscope, IconBuildingStore } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const programs = [
  { key: 'computerScience', icon: IconCode, color: 'brand' },
  { key: 'business', icon: IconBuildingStore, color: 'blue' },
  { key: 'environmental', icon: IconLeaf, color: 'green' },
  { key: 'arts', icon: IconPalette, color: 'grape' },
  { key: 'medicine', icon: IconStethoscope, color: 'red' },
  { key: 'law', icon: IconTrophy, color: 'orange' },
];

export function ProgramsSection() {
  const { t } = useTranslation();

  return (
    <Container size="lg" py={80} id="programs">
      <Title order={2} ta="center" mb={50} fw={800} size="h1" c="dark.8">
        {t('programs.title')}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {programs.map((prog, i) => (
          <Card key={i} padding="xl" radius="lg" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #f1f3f5', transition: 'transform 0.2s', cursor: 'pointer' }} 
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Center bg={`${prog.color}.0`} w={60} h={60} style={{ borderRadius: '12px', marginBottom: '1.5rem' }}>
              <prog.icon size={32} color={`var(--mantine-color-${prog.color}-6)`} stroke={1.5} />
            </Center>
            <Title order={3} size="h4" fw={700} mb="xs">{t(`programs.list.${prog.key}.title`)}</Title>
            <Text c="dimmed" lh={1.6} mb="lg" style={{ flexGrow: 1 }}>{t(`programs.list.${prog.key}.desc`)}</Text>
            <Anchor href="#" fw={600} size="sm" c="brand">
              {t('programs.learnMore')}
            </Anchor>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
