import React from 'react';
import { Stack, Box, StackProps, BoxProps } from '@mantine/core';

export interface FormProps extends Omit<BoxProps, 'onSubmit'> {
  children: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  stackProps?: StackProps;
}

export const Form = ({ children, onSubmit, stackProps, ...others }: FormProps) => {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    // We allow the parent to handle the actual submit logic (including e.preventDefault if needed)
    if (onSubmit) {
      onSubmit(e);
    }

    // Logic to focus the first error after a short delay to allow the DOM to update
    setTimeout(() => {
      // Search for common Mantine error indicators or invalid fields
      const firstError = document.querySelector(
        '[data-invalid="true"], [aria-invalid="true"], .mantine-Input-error'
      );

      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // If it's an input/select/etc, try to focus it
        if (firstError instanceof HTMLElement) {
          // Sometimes the error is on a wrapper, so we look for an input inside
          const input = firstError.querySelector('input, select, textarea') || firstError;
          if (input instanceof HTMLElement) {
            input.focus();
          }
        }
      }
    }, 150);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      mx="auto"
      w="100%"
      style={{ maxWidth: 604 }}
      {...others}
    >
      <Stack gap="md" {...stackProps}>
        {children}
      </Stack>
    </Box>
  );
};

Form.displayName = 'Form';
