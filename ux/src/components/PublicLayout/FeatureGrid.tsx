import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  SimpleGrid, 
  Paper, 
  ThemeIcon, 
  Stack, 
  rem 
} from '@mantine/core';

export interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features: {
    icon: React.ElementType;
    title: string;
    description: string;
    color?: string;
  }[];
}

export const FeatureGrid = ({ title, subtitle, features }: FeatureGridProps) => {
  return (
    <Box py={80} style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Container size="xl">
        {(title || subtitle) && (
          <Stack gap="xs" align="center" ta="center" mb={60}>
            {title && (
              <Title order={2} style={{ fontSize: rem(42), fontWeight: 900, letterSpacing: rem(-1) }}>
                {title}
              </Title>
            )}
            {subtitle && (
              <Text size="xl" c="dimmed" maw={700}>
                {subtitle}
              </Text>
            )}
          </Stack>
        )}

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={30}>
          {features.map((feature, index) => (
            <Paper 
              key={index} 
              p="xl" 
              radius="xs" 
              withBorder 
              shadow="sm"
              style={{ 
                height: '100%',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <ThemeIcon 
                size={50} 
                radius="xs" 
                variant="light" 
                color={feature.color || 'brand'} 
                mb="xl"
              >
                <feature.icon size={26} stroke={1.5} />
              </ThemeIcon>
              <Text fw={700} size="lg" mb="sm">
                {feature.title}
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                {feature.description}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

import { Box } from '@mantine/core';
