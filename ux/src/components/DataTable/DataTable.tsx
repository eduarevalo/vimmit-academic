import React from 'react';
import { 
  Table, 
  LoadingOverlay, 
  Box, 
  Text, 
  Center, 
  ScrollArea, 
  TableProps as MantineTableProps,
  Checkbox,
  ActionIcon,
  rem
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

export interface DataTableProps extends MantineTableProps {
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  height?: number | string;
  onRowClick?: (id: string) => void;
}

export const DataTable = ({ 
  loading, 
  empty, 
  emptyMessage = 'No data found', 
  children, 
  height,
  onRowClick,
  ...others 
}: DataTableProps) => {
  return (
    <ScrollArea h={height}>
      <Box pos="relative" mih={loading ? 200 : undefined}>
        <LoadingOverlay 
          visible={loading} 
          overlayProps={{ blur: 1 }} 
          zIndex={10}
        />
        
        {empty && !loading ? (
          <Center py={60}>
            <Text c="dimmed">{emptyMessage}</Text>
          </Center>
        ) : (
          <Table 
            highlightOnHover 
            verticalSpacing="sm" 
            {...others}
            style={{ 
              borderCollapse: 'separate', 
              borderSpacing: `0 ${rem(4)}`,
              ...others.style 
            }}
          >
            {children}
          </Table>
        )}
      </Box>
    </ScrollArea>
  );
};

// Sub-components
const SelectionHeader = ({ checked, indeterminate, onChange }: { checked: boolean, indeterminate?: boolean, onChange: (val: boolean) => void }) => (
  <Table.Th style={{ width: rem(40) }}>
    <Checkbox 
      checked={checked} 
      indeterminate={indeterminate} 
      onChange={(event) => onChange(event.currentTarget.checked)} 
      radius="xs"
      color="brand"
    />
  </Table.Th>
);

const SelectionCell = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
  <Table.Td onClick={(e) => e.stopPropagation()}>
    <Checkbox 
      checked={checked} 
      onChange={(event) => onChange(event.currentTarget.checked)} 
      radius="xs"
      color="brand"
    />
  </Table.Td>
);

const ActionChevron = () => (
  <Table.Td style={{ textAlign: 'right', width: rem(48) }}>
    <ActionIcon variant="subtle" color="brand" radius="xs">
      <IconChevronRight size={18} stroke={1.5} />
    </ActionIcon>
  </Table.Td>
);

DataTable.displayName = 'DataTable';

DataTable.Thead = Table.Thead;
DataTable.Tbody = Table.Tbody;
DataTable.Tr = Table.Tr;
DataTable.Th = Table.Th;
DataTable.Td = Table.Td;
DataTable.SelectionHeader = SelectionHeader;
DataTable.SelectionCell = SelectionCell;
DataTable.ActionChevron = ActionChevron;
