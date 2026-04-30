import React from 'react';
import { Flex, FlexProps } from '@mantine/core';

export interface FormActionsProps extends FlexProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const FormActions = ({ children, fullWidth, ...others }: FormActionsProps) => {
  return (
    <Flex
      direction={{ base: 'column-reverse', sm: 'row' }}
      justify="flex-end"
      gap="sm"
      mt="xl"
      {...others}
    >
      {React.Children.map(children, (child) => 
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement<any>, { 
              style: fullWidth ? { flex: 1, ...child.props.style } : child.props.style 
            }) 
          : child
      )}
    </Flex>
  );
};

FormActions.displayName = 'FormActions';
