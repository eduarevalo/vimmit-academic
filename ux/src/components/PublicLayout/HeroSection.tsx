import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Box, 
  Stack, 
  AspectRatio, 
  Image,
  rem 
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

export interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: string;
  ctaPrimary?: { label: string; onClick?: () => void };
  ctaSecondary?: { label: string; onClick?: () => void };
  image?: string;
}

export const HeroSection = ({ 
  title, 
  subtitle, 
  ctaPrimary, 
  ctaSecondary,
  image 
}: HeroSectionProps) => {
  return (
    <Box 
      py={{ base: rem(60), md: rem(100) }}
      style={{ 
        backgroundColor: 'white',
        overflow: 'hidden'
      }}
    >
      <Container size="xl">
        <Group align="center" justify="space-between" wrap="nowrap" gap={60}>
          <Stack gap="xl" style={{ flex: 1, maxWidth: rem(600) }}>
            <Title 
              order={1} 
              style={{ 
                fontSize: rem(56), 
                fontWeight: 900, 
                lineHeight: 1.1,
                letterSpacing: rem(-2)
              }}
            >
              {title}
            </Title>
            <Text size="xl" c="dimmed" style={{ lineHeight: 1.6 }}>
              {subtitle}
            </Text>
            <Group gap="md">
              {ctaPrimary && (
                <Button 
                  size="xl" 
                  radius="xs" 
                  color="brand"
                  rightSection={<IconArrowRight size={20} />}
                  onClick={ctaPrimary.onClick}
                >
                  {ctaPrimary.label}
                </Button>
              )}
              {ctaSecondary && (
                <Button 
                  size="xl" 
                  radius="xs" 
                  variant="outline" 
                  color="secondary"
                  onClick={ctaSecondary.onClick}
                >
                  {ctaSecondary.label}
                </Button>
              )}
            </Group>
          </Stack>

          <Box visibleFrom="md" style={{ flex: 1 }}>
            <AspectRatio ratio={4/3}>
              <Image 
                src={image || "/assets/placeholders/hero_main.png"} 
                alt="Institutional Hero"
                radius="xs"
                style={{ 
                  boxShadow: 'var(--mantine-shadow-xl)',
                  border: '1px solid var(--mantine-color-gray-2)'
                }}
              />
            </AspectRatio>
          </Box>
        </Group>
      </Container>
    </Box>
  );
};
