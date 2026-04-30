import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Stack, 
  AspectRatio, 
  Image, 
  Box,
  rem 
} from '@mantine/core';

export interface NarrativeBlockProps {
  title: string;
  description: React.ReactNode;
  image: string;
  imagePosition?: 'left' | 'right';
  badge?: string;
  backgroundColor?: string;
}

export const NarrativeBlock = ({ 
  title, 
  description, 
  image, 
  imagePosition = 'left',
  badge,
  backgroundColor = 'white'
}: NarrativeBlockProps) => {
  const content = (
    <Stack gap="lg" style={{ flex: 1 }}>
      {badge && (
        <Text size="xs" fw={800} tt="uppercase" c="brand" style={{ letterSpacing: rem(2) }}>
          {badge}
        </Text>
      )}
      <Title order={2} style={{ fontSize: rem(36), fontWeight: 900, letterSpacing: rem(-1) }}>
        {title}
      </Title>
      <Box style={{ fontSize: rem(18), lineHeight: 1.8, color: 'var(--mantine-color-gray-7)' }}>
        {description}
      </Box>
    </Stack>
  );

  const imageBox = (
    <Box style={{ flex: 1 }}>
      <AspectRatio ratio={16 / 9}>
        <Image 
          src={image} 
          alt={title} 
          radius="xs" 
          shadow="md"
          style={{ border: '1px solid var(--mantine-color-gray-2)' }}
        />
      </AspectRatio>
    </Box>
  );

  return (
    <Box py={100} style={{ backgroundColor }}>
      <Container size="xl">
        <Group align="center" gap={80} wrap="nowrap" direction={imagePosition === 'right' ? 'row-reverse' : 'row'}>
          {imagePosition === 'left' ? (
            <>
              {imageBox}
              {content}
            </>
          ) : (
            <>
              {content}
              {imageBox}
            </>
          )}
        </Group>
      </Container>
    </Box>
  );
};
