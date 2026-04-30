import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  defaultRadius: 'xs',
  fontFamily: 'Inter, system-ui, sans-serif',
  
  shadows: {
    xs: `0 ${rem(1)} ${rem(3)} rgba(0, 0, 0, 0.03), 0 ${rem(1)} ${rem(2)} rgba(0, 0, 0, 0.05)`,
    sm: `0 ${rem(1)} ${rem(3)} rgba(0, 0, 0, 0.05), 0 ${rem(8)} ${rem(12)} rgba(0, 0, 0, 0.03)`,
    md: `0 ${rem(2)} ${rem(6)} rgba(0, 0, 0, 0.05), 0 ${rem(12)} ${rem(20)} rgba(0, 0, 0, 0.04)`,
    lg: `0 ${rem(4)} ${rem(12)} rgba(0, 0, 0, 0.06), 0 ${rem(16)} ${rem(32)} rgba(0, 0, 0, 0.05)`,
  },

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
    // Azul Corporativo (Secondary)
    secondary: [
      '#ECF5FE',
      '#D7E8F7',
      '#ABCEF0',
      '#7CB4EB',
      '#579EE7',
      '#4390E5',
      '#3789E5',
      '#2C76CC',
      '#2169B7',
      '#0A4D8A',
    ],
    // Rojo Armónico
    error: [
      '#fff5f5',
      '#ffe3e3',
      '#ffc9c9',
      '#ffa8a8',
      '#ff8787',
      '#ff6b6b',
      '#fa5252',
      '#f03e3e',
      '#e03131',
      '#c92a2a',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'xs',
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'xs',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          borderColor: 'var(--mantine-color-brand-2)',
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'xs',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'xs',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'xs',
      },
    },
    Select: {
      defaultProps: {
        radius: 'xs',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'xs',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'xs',
      },
    },
  },
});
