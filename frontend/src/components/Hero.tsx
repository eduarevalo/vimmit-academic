import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../hooks/useInstitution';

export function Hero() {
  const { t } = useTranslation();
  const { name } = useInstitution();

  return (
    <Box 
      pt={140}
      pb={120}
      style={{ 
        background: 'linear-gradient(145deg, #eefcf1 0%, #e0f2fe 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container size="md" style={{ position: 'relative', zIndex: 2 }}>
        <Title order={1} style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: '#1a1b1e' }} mb="md">
          {t('hero.welcome')} <span style={{ color: '#16884a' }}>{name}</span>
        </Title>
        <Text size="xl" c="dimmed" style={{ maxWidth: 650, margin: '0 auto 40px', lineHeight: 1.6 }}>
          {t('hero.subtitle')}
        </Text>
        <Group justify="center">
          <Button size="xl" radius="xl" rightSection={<IconArrowRight size={20} />} style={{ boxShadow: '0 8px 15px rgba(22, 136, 74, 0.2)' }}>
            {t('hero.explorePrograms')}
          </Button>
          <Button size="xl" variant="white" radius="xl" c="dark.8">
            {t('hero.learnMore')}
          </Button>
        </Group>
      </Container>
    </Box>
  );
}
