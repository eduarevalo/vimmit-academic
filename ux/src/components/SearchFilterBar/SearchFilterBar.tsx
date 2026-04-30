import React from 'react';
import { 
  Group, 
  TextInput, 
  Tabs, 
  Box, 
  Stack, 
  Divider,
  type TabsProps,
  type TextInputProps
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export interface SearchFilterBarProps {
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchProps?: Partial<TextInputProps>;
  
  // Tabs
  tabsValue?: string | null;
  onTabChange?: (value: string | null) => void;
  tabs?: { value: string; label: string; count?: number }[];
  tabsProps?: Partial<TabsProps>;

  // Actions / Extra Filters
  actions?: React.ReactNode;
}

export const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  searchProps,
  tabsValue,
  onTabChange,
  tabs,
  tabsProps,
  actions
}: SearchFilterBarProps) => {
  return (
    <Stack gap="md" w="100%">
      <Group justify="space-between" align="center">
        <TextInput
          placeholder="Buscar..."
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 400 }}
          {...searchProps}
        />
        <Group gap="sm">
          {actions}
        </Group>
      </Group>

      {tabs && tabs.length > 0 && (
        <Tabs 
          value={tabsValue} 
          onChange={onTabChange} 
          variant="pills" 
          radius="xs"
          {...tabsProps}
        >
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab 
                key={tab.value} 
                value={tab.value}
                rightSection={tab.count !== undefined ? (
                  <Box 
                    component="span" 
                    px={6} 
                    py={2} 
                    style={{ 
                      fontSize: 10, 
                      fontWeight: 700,
                      borderRadius: 'var(--mantine-radius-xs)', 
                      backgroundColor: tab.value === tabsValue ? 'rgba(255, 255, 255, 0.2)' : 'var(--mantine-color-brand-1)',
                      color: tab.value === tabsValue ? 'white' : 'var(--mantine-color-brand-8)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab.count}
                  </Box>
                ) : null}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      )}
      <Divider color="brand.1" />
    </Stack>
  );
};

SearchFilterBar.displayName = 'SearchFilterBar';
