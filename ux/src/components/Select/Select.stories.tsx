import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    label: 'Academic Period',
    placeholder: 'Select a period',
    data: [
      { value: '2021-1', label: '2021 Semestre 1' },
      { value: '2021-2', label: '2021 Semestre 2' },
      { value: '2022-1', label: '2022 Semestre 1' },
    ],
  },
};

export const Searchable: Story = {
  args: {
    label: 'Campus',
    placeholder: 'Search for a campus',
    searchable: true,
    data: ['Main Campus', 'North Branch', 'Online'],
  },
};
