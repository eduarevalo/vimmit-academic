import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { MantineProvider } from '@mantine/core';
import { VimmitTheme } from '../src/theme/VimmitTheme';
import '@mantine/core/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={VimmitTheme}>
        <Story />
      </MantineProvider>
    ),
  ],
};

export default preview;
