import type { Meta, StoryObj } from '@storybook/react';
import { WelcomeEmail, GradeNotification, AuthEmail } from './EmailTemplates';

const meta: Meta = {
  title: 'Components/Email',
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f4f4f5' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
};

export default meta;

export const Welcome: StoryObj = {
  render: () => <WelcomeEmail name="Juan Pérez" />,
};

export const Grades: StoryObj = {
  render: () => (
    <GradeNotification 
      studentName="Juan Pérez" 
      course="Cálculo Diferencial e Integral III" 
      grade="9.5 / 10" 
    />
  ),
};

export const Verification: StoryObj = {
  render: () => <AuthEmail code="842-109" />,
};
