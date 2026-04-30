import React from 'react';
import { Stack, Title, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

export interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
}

export const ContentSection = ({ title, children, onSeeAll }: ContentSectionProps) => {
  return (
    <Stack gap="md" py="xl">
      <Group justify="space-between" align="center" px="xs">
        <Title order={3} fw={800} style={{ letterSpacing: -0.5 }}>
          {title}
        </Title>
        {onSeeAll && (
          <UnstyledButton onClick={onSeeAll}>
            <Group gap={4}>
              <Text size="sm" fw={600} c="brand">Ver todo</Text>
              <IconChevronRight size={14} color="var(--mantine-color-brand-6)" />
            </Group>
          </UnstyledButton>
        )}
      </Group>
      {children}
    </Stack>
  );
};

ContentSection.displayName = 'ContentSection';
