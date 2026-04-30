import React from 'react';
import { Select as MantineSelect, SelectProps, rem } from '@mantine/core';

export type VimmitSelectProps = SelectProps;

export const Select = React.forwardRef<HTMLInputElement, SelectProps>((props, ref) => {
  return (
    <MantineSelect
      ref={ref}
      withErrorStyles={false}
      styles={{
        label: { marginBottom: rem(4), fontWeight: 500 },
        wrapper: {
          borderRadius: 'var(--mantine-radius-xs)',
          '&:focus-within': {
            outline: `${rem(2)} solid var(--mantine-color-brand-6)`,
            outlineOffset: rem(2),
          },
        },
        input: {
          '&:focus': {
            borderColor: 'var(--mantine-color-gray-4)',
          },
        },
      }}
      {...props}
    />
  );
});

Select.displayName = 'Select';
