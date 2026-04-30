import React from 'react';
import { PasswordInput as MantinePasswordInput, PasswordInputProps, rem } from '@mantine/core';

export type VimmitPasswordInputProps = PasswordInputProps;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  return (
    <MantinePasswordInput
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
          '&:focus, &:focus-within': {
            borderColor: 'var(--mantine-color-gray-4)',
          },
        },
      }}
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
