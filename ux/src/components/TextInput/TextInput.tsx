import React from 'react';
import { TextInput as MantineTextInput, TextInputProps } from '@mantine/core';

export type VimmitTextInputProps = TextInputProps;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  return (
    <MantineTextInput
      ref={ref}
      withErrorStyles={false}
      {...props}
    />
  );
});

TextInput.displayName = 'TextInput';
