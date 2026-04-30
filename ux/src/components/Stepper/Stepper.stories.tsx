import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';
import { Box } from '@mantine/core';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  args: {
    active: 1,
    children: [
      <Stepper.Step key={1} label="Step 1" description="Personal info" />,
      <Stepper.Step key={2} label="Step 2" description="Account details" />,
      <Stepper.Step key={3} label="Step 3" description="Verification" />,
    ],
  },
};

export const Minimal: Story = {
  args: {
    active: 0,
    children: [
      <Stepper.Step key={1} label="Info" />,
      <Stepper.Step key={2} label="Upload" />,
      <Stepper.Step key={3} label="Final" />,
    ],
  },
};

export const Completed: Story = {
  args: {
    active: 3,
    children: [
      <Stepper.Step key={1} label="Step 1" />,
      <Stepper.Step key={2} label="Step 2" />,
      <Stepper.Step key={3} label="Step 3" />,
    ],
  },
};
