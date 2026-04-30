import React from 'react';
import { Stepper as MantineStepper, StepperProps } from '@mantine/core';

export interface VimmitStepperProps extends StepperProps {}

export const Stepper = (props: StepperProps) => {
  return (
    <MantineStepper
      color="brand"
      radius="xs"
      size="sm"
      styles={{
        stepIcon: { 
          borderWidth: 2,
        },
        stepLabel: { 
          fontSize: '11px', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          marginTop: '4px'
        },
        stepBody: {
          marginLeft: '8px'
        },
        separator: {
          marginLeft: '8px',
          marginRight: '8px'
        }
      }}
      {...props}
    />
  );
};

Stepper.Step = MantineStepper.Step;
Stepper.Completed = MantineStepper.Completed;

Stepper.displayName = 'Stepper';
