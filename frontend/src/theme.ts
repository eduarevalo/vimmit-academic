import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  fontFamily: 'Inter, system-ui, sans-serif',
  defaultRadius: 'md',
  colors: {
    brand: [
      '#eefcf1',
      '#daf2e3',
      '#aee2c3',
      '#7fcea1',
      '#56bf84',
      '#3cb470',
      '#2cae65',
      '#1f9955',
      '#16884a',
      '#0a763c',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'lg',
        withBorder: false,
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
  },
});
