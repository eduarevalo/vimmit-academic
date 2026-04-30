import type { Meta, StoryObj } from '@storybook/react';
import { SearchFilterBar } from './SearchFilterBar';
import { Button } from '../Button/Button';
import { IconRefresh, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

const meta: Meta<typeof SearchFilterBar> = {
  title: 'Components/SearchFilterBar',
  component: SearchFilterBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchFilterBar>;

const SearchFilterBarWrapper = (props: any) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<string | null>('all');
  
  return (
    <SearchFilterBar
      {...props}
      searchValue={search}
      onSearchChange={setSearch}
      tabsValue={tab}
      onTabChange={setTab}
    />
  );
};

export const Default: Story = {
  render: () => (
    <SearchFilterBarWrapper
      tabs={[
        { value: 'all', label: 'All Items', count: 125 },
        { value: 'active', label: 'Active', count: 84 },
        { value: 'archived', label: 'Archived', count: 41 },
      ]}
      actions={
        <>
          <Button variant="light" color="gray" leftSection={<IconRefresh size={16} />}>Refresh</Button>
          <Button color="brand" leftSection={<IconPlus size={16} />}>Add New</Button>
        </>
      }
    />
  ),
};

export const Simple: Story = {
  args: {
    searchValue: '',
    onSearchChange: (val: string) => console.log(val),
  },
};
