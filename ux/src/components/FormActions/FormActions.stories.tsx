import type { Meta, StoryObj } from '@storybook/react';
import { FormActions } from './FormActions';
import { Button } from '../Button/Button';
import { Box } from '@mantine/core';

const meta: Meta<typeof FormActions> = {
  title: 'Components/FormActions',
  component: FormActions,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormActions>;

export const Default: Story = {
  render: (args) => (
    <Box maw={604} mx="auto">
      <FormActions {...args}>
        <Button variant="subtle" color="gray">Cancel</Button>
        <Button>Submit</Button>
      </FormActions>
    </Box>
  ),
};

export const FullWidth_50_50: Story = {
  args: {
    fullWidth: true,
  },
  render: (args) => (
    <Box maw={604} mx="auto">
      <FormActions {...args}>
        <Button variant="outline" color="gray">Delete</Button>
        <Button color="brand">Save Changes</Button>
      </FormActions>
    </Box>
  ),
};

export const SingleButton: Story = {
  render: (args) => (
    <Box maw={604} mx="auto">
      <FormActions {...args}>
        <Button color="brand">Continue</Button>
      </FormActions>
    </Box>
  ),
};
