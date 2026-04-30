import React from 'react';
import { Button as MantineButton, ButtonProps, PolymorphicComponentProps } from '@mantine/core';

export type VimmitButtonProps = ButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <MantineButton ref={ref} {...props} />;
});

Button.displayName = 'Button';
