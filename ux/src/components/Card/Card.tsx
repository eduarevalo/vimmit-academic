import React from 'react';
import { Card as MantineCard, CardProps, SimpleGrid, rem } from '@mantine/core';

export interface VimmitCardProps extends CardProps {
  children: React.ReactNode;
}

export const Card = ({ children, ...others }: VimmitCardProps) => {
  return (
    <MantineCard
      {...others}
    >
      {children}
    </MantineCard>
  );
};

interface CardActionsProps {
  children: React.ReactNode;
  gap?: string | number;
}

const CardActions = ({ children, gap = 'sm' }: CardActionsProps) => {
  const childrenCount = React.Children.count(children);
  
  if (childrenCount === 0) return null;

  return (
    <MantineCard.Section 
      px="lg"
      pt="lg"
      pb="lg"
      mt="sm"
      style={{ marginBottom: 'calc(-1 * var(--mantine-spacing-md))' }}
    >
      <SimpleGrid cols={childrenCount === 2 ? 2 : 1} spacing={gap}>
        {children}
      </SimpleGrid>
    </MantineCard.Section>
  );
};

Card.Section = MantineCard.Section;
Card.Actions = CardActions;

Card.displayName = 'Card';
