import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Text, Image, Badge, Group, Stack } from '@mantine/core';
import { Button } from '../Button/Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const WithActions: Story = {
  render: () => (
    <Card shadow="sm" padding="lg" radius="xs" withBorder style={{ maxWidth: 400 }}>
      <Card.Section>
        <Image
          src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
          height={160}
          alt="Norway"
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={700}>Norway Fjord Adventures</Text>
        <Badge color="secondary" variant="light" radius="xs">Explore</Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        Explore the magical fjord landscapes with tours and
        activities on and around the fjords of Norway.
      </Text>

      <Card.Actions>
        <Button variant="subtle" color="gray">Cancel</Button>
        <Button color="brand">Book now</Button>
      </Card.Actions>
    </Card>
  ),
};

export const MultiActions: Story = {
  render: () => (
    <Card shadow="xs" padding="xl" radius="xs" withBorder style={{ maxWidth: 400 }}>
      <Stack gap="xs" mb="lg">
        <Text fw={800} size="lg">Delete Account</Text>
        <Text size="sm" c="dimmed">This action is permanent and cannot be undone.</Text>
      </Stack>
      
      <Card.Actions>
        <Button variant="light" color="gray">I'll keep it</Button>
        <Button color="error">Delete anyway</Button>
      </Card.Actions>
    </Card>
  ),
};
