import type { Meta, StoryObj } from '@storybook/react';
import { 
  Paper, TextInput, PasswordInput, Checkbox, Button, Group, 
  Anchor, Divider, Text, Container, Title, Stack, Box, Center
} from '@mantine/core';
import { IconBrandGoogle, IconBrandOffice, IconSchool, IconArrowLeft } from '@tabler/icons-react';

const meta: Meta = {
  title: 'Templates/Auth',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Login: StoryObj = {
  render: () => (
    <Box bg="gray.0" mih="100vh" style={{ display: 'flex', alignItems: 'center' }}>
      <Container size="xs" w="100%">
        <Paper radius="xs" p="xl" withBorder shadow="md" bg="white">
          <Stack gap="xl">
            {/* Logo area */}
            <Center mb="md">
              <Group gap="xs">
                <img 
                  src="/logo.jpg" 
                  alt="Logo" 
                  style={{ 
                    height: 32, 
                    borderRadius: 'var(--mantine-radius-xs)' 
                  }} 
                />
                <Title order={2} fw={900} style={{ letterSpacing: -1 }}>Aseder</Title>
              </Group>
            </Center>

            <Box>
              <Title order={3} fw={800} style={{ letterSpacing: -0.5 }}>Bienvenido</Title>
              <Text c="brand.4" size="sm">Ingresa tus credenciales institucionales para continuar.</Text>
            </Box>

            <Stack gap="md">
              <TextInput 
                label="Correo Institucional" 
                placeholder="nombre@aseder.edu.co" 
                radius="xs" 
                size="md"
                required
              />
              <PasswordInput 
                label="Contraseña" 
                placeholder="Tu contraseña" 
                radius="xs" 
                size="md"
                required
              />
            </Stack>

            <Group justify="space-between">
              <Checkbox label="Recordar sesión" radius="xs" color="brand" />
              <Anchor component="button" size="sm" color="secondary" fw={600}>
                ¿Olvidaste tu contraseña?
              </Anchor>
            </Group>

            <Button color="brand" radius="xs" size="md" fullWidth>
              Iniciar Sesión
            </Button>

            <Divider label="O accede con" labelPosition="center" my="sm" />

            <Group grow>
              <Button 
                variant="outline" 
                color="gray" 
                radius="xs" 
                leftSection={<IconBrandGoogle size={18} />}
              >
                Google
              </Button>
              <Button 
                variant="outline" 
                color="gray" 
                radius="xs" 
                leftSection={<IconBrandOffice size={18} />}
              >
                Office 365
              </Button>
            </Group>

            <Text ta="center" size="sm">
              ¿No tienes una cuenta?{' '}
              <Anchor component="button" fw={700} color="secondary">
                Regístrate aquí
              </Anchor>
            </Text>
          </Stack>
        </Paper>
        <Text ta="center" size="xs" mt="xl" c="dimmed">
          © 2024 Aseder. Todos los derechos reservados.
        </Text>
      </Container>
    </Box>
  )
};

export const Register: StoryObj = {
  render: () => (
    <Box bg="gray.0" mih="100vh" py={40} style={{ display: 'flex', alignItems: 'center' }}>
      <Container size="xs" w="100%">
        <Paper radius="xs" p="xl" withBorder shadow="md" bg="white">
          <Stack gap="xl">
            <Center>
              <Group gap="xs">
                <img 
                  src="/logo.jpg" 
                  alt="Logo" 
                  style={{ 
                    height: 24, 
                    borderRadius: 'var(--mantine-radius-xs)' 
                  }} 
                />
                <Title order={3} fw={900} style={{ letterSpacing: -1 }}>Aseder</Title>
              </Group>
            </Center>

            <Box>
              <Title order={3} fw={800} style={{ letterSpacing: -0.5 }}>Crear Cuenta</Title>
              <Text c="brand.4" size="sm">Únete a nuestra comunidad académica digital.</Text>
            </Box>

            <Stack gap="md">
              <TextInput 
                label="Nombre Completo" 
                placeholder="Ej: Juan Pérez" 
                radius="xs" 
                required
              />
              <TextInput 
                label="Correo Institucional" 
                placeholder="nombre@aseder.edu.co" 
                radius="xs" 
                required
              />
              <TextInput 
                label="ID de Estudiante / Profesor" 
                placeholder="Ej: ST-2024-001" 
                radius="xs" 
                required
              />
              <PasswordInput 
                label="Contraseña" 
                placeholder="Mínimo 8 caracteres" 
                radius="xs" 
                required
              />
              <PasswordInput 
                label="Confirmar Contraseña" 
                placeholder="Repite tu contraseña" 
                radius="xs" 
                required
              />
            </Stack>

            <Checkbox 
              label={
                <Text size="sm">
                  Acepto los{' '}
                  <Anchor component="button" inherit color="secondary" fw={700}>
                    Términos y Condiciones
                  </Anchor>
                  {' '}y la{' '}
                  <Anchor component="button" inherit color="secondary" fw={700}>
                    Política de Privacidad
                  </Anchor>
                </Text>
              }
              radius="xs" 
              color="brand"
              required
            />

            <Button color="brand" radius="xs" size="md" fullWidth>
              Registrarse
            </Button>

            <Text ta="center" size="sm">
              ¿Ya tienes una cuenta?{' '}
              <Anchor component="button" fw={700} color="secondary">
                Inicia sesión
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
};

export const RecoverPassword: StoryObj = {
  render: () => (
    <Box bg="gray.0" mih="100vh" style={{ display: 'flex', alignItems: 'center' }}>
      <Container size="xs" w="100%">
        <Paper radius="xs" p="xl" withBorder shadow="md" bg="white">
          <Stack gap="xl">
            <Center>
              <Group gap="xs">
                <img 
                  src="/logo.jpg" 
                  alt="Logo" 
                  style={{ 
                    height: 24, 
                    borderRadius: 'var(--mantine-radius-xs)' 
                  }} 
                />
                <Title order={3} fw={900} style={{ letterSpacing: -1 }}>Aseder</Title>
              </Group>
            </Center>

            <Box>
              <Title order={3} fw={800} style={{ letterSpacing: -0.5 }}>Recuperar Contraseña</Title>
              <Text c="brand.4" size="sm">Te enviaremos un enlace de recuperación a tu correo.</Text>
            </Box>

            <Stack gap="md">
              <TextInput 
                label="Correo Institucional" 
                placeholder="nombre@aseder.edu.co" 
                radius="xs" 
                size="md"
                required
              />
            </Stack>

            <Button color="brand" radius="xs" size="md" fullWidth>
              Enviar Enlace
            </Button>

            <Center>
              <Button 
                variant="subtle" 
                color="secondary" 
                radius="xs" 
                leftSection={<IconArrowLeft size={16} />}
              >
                Volver al inicio de sesión
              </Button>
            </Center>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
};
