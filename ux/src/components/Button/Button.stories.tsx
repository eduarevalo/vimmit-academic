import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'light', 'outline', 'subtle', 'transparent', 'white', 'default'],
    },
    color: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Action',
    variant: 'filled',
    color: 'brand',
  },
};

export const Outline: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'outline',
    color: 'brand',
  },
};

export const Subtle: Story = {
  args: {
    children: 'Subtle Button',
    variant: 'subtle',
    color: 'brand',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Action',
    size: 'lg',
    color: 'brand',
  },
};
