import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Text, Badge, Group, Box } from '@mantine/core';
import { useState } from 'react';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const MOCK_DATA = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
  { id: '3', name: 'Robert Brown', email: 'robert@example.com', status: 'Inactive' },
  { id: '4', name: 'Alice Wilson', email: 'alice@example.com', status: 'Active' },
];

export const Default: Story = {
  render: () => (
    <DataTable>
      <DataTable.Thead>
        <DataTable.Tr>
          <DataTable.Th>Name</DataTable.Th>
          <DataTable.Th>Email</DataTable.Th>
          <DataTable.Th>Status</DataTable.Th>
          <DataTable.Th style={{ textAlign: 'right' }}>Details</DataTable.Th>
        </DataTable.Tr>
      </DataTable.Thead>
      <DataTable.Tbody>
        {MOCK_DATA.map((row) => (
          <DataTable.Tr key={row.id} style={{ cursor: 'pointer' }}>
            <DataTable.Td>
              <Text size="sm" fw={600}>{row.name}</Text>
            </DataTable.Td>
            <DataTable.Td>
              <Text size="sm" c="dimmed">{row.email}</Text>
            </DataTable.Td>
            <DataTable.Td>
              <Badge 
                variant="light" 
                color={row.status === 'Active' ? 'brand' : 'secondary'}
                radius="xs"
              >
                {row.status}
              </Badge>
            </DataTable.Td>
            <DataTable.ActionChevron />
          </DataTable.Tr>
        ))}
      </DataTable.Tbody>
    </DataTable>
  ),
};

export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    
    const toggleRow = (id: string) => {
      setSelected(current => 
        current.includes(id) ? current.filter(i => i !== id) : [...current, id]
      );
    };

    const toggleAll = (checked: boolean) => {
      setSelected(checked ? MOCK_DATA.map(r => r.id) : []);
    };

    return (
      <DataTable>
        <DataTable.Thead>
          <DataTable.Tr>
            <DataTable.SelectionHeader 
              checked={selected.length === MOCK_DATA.length}
              indeterminate={selected.length > 0 && selected.length < MOCK_DATA.length}
              onChange={toggleAll}
            />
            <DataTable.Th>Name</DataTable.Th>
            <DataTable.Th>Status</DataTable.Th>
            <DataTable.ActionChevron />
          </DataTable.Tr>
        </DataTable.Thead>
        <DataTable.Tbody>
          {MOCK_DATA.map((row) => (
            <DataTable.Tr 
              key={row.id} 
              style={{ cursor: 'pointer' }}
              onClick={() => console.log('Navigate to', row.id)}
            >
              <DataTable.SelectionCell 
                checked={selected.includes(row.id)}
                onChange={() => toggleRow(row.id)}
              />
              <DataTable.Td>
                <Text size="sm" fw={600}>{row.name}</Text>
              </DataTable.Td>
              <DataTable.Td>
                <Badge variant="dot" color={row.status === 'Active' ? 'brand' : 'secondary'}>{row.status}</Badge>
              </DataTable.Td>
              <DataTable.ActionChevron />
            </DataTable.Tr>
          ))}
        </DataTable.Tbody>
      </DataTable>
    );
  }
};
