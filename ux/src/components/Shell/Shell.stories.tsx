import type { Meta, StoryObj } from '@storybook/react';
import { Shell } from './Shell';
import { 
  NavLink, 
  Stack, 
  Title, 
  Text, 
  SimpleGrid, 
  Group, 
  Box,
  Divider,
  ThemeIcon
} from '@mantine/core';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { 
  IconGauge, 
  IconFingerprint, 
  IconActivity, 
  IconHome,
  IconUsers,
  IconCalendar,
  IconDatabase,
  IconBell
} from '@tabler/icons-react';

const meta: Meta<typeof Shell> = {
  title: 'Layout/Shell',
  component: Shell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Shell>;

const NavbarContent = () => (
  <Stack gap="xs">
    <NavLink label="Dashboard" leftSection={<IconHome size={18} />} active />
    <NavLink label="Students" leftSection={<IconUsers size={18} />} />
    <NavLink label="Calendar" leftSection={<IconCalendar size={18} />} />
    <NavLink label="Reports" leftSection={<IconActivity size={18} />} />
    <NavLink label="Database" leftSection={<IconDatabase size={18} />} />
  </Stack>
);

const AsideContent = () => (
  <Stack>
    <Title order={4}>Activity Feed</Title>
    <Text size="sm">Recent enrollment from John Doe</Text>
    <Text size="sm">System update completed</Text>
    <Divider />
    <Title order={4}>Quick Actions</Title>
    <Button variant="light" color="brand" fullWidth>New Student</Button>
  </Stack>
);

export const Application: Story = {
  args: {
    variant: 'app',
    user: {
      name: 'Eduardo Arévalo',
      email: 'eduardo@vimmit.com',
      image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png'
    },
    navbarContent: <NavbarContent />,
    asideContent: <AsideContent />,
    children: (
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={2}>Executive Overview</Title>
          <Button color="brand">Generate Report</Button>
        </Group>
        
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <Card p="xl">
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Active Students</Text>
            <Text fz="xl" fw={700}>2,543</Text>
            <Text size="sm" c="green" mt="xs">+12% from last month</Text>
          </Card>
          <Card p="xl">
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Retention Rate</Text>
            <Text fz="xl" fw={700}>94.2%</Text>
            <Text size="sm" c="green" mt="xs">+2.4% from last period</Text>
          </Card>
          <Card p="xl">
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>New Leads</Text>
            <Text fz="xl" fw={700}>186</Text>
            <Text size="sm" c="red" mt="xs">-4% from last week</Text>
          </Card>
        </SimpleGrid>

        <Card p="xl">
          <Title order={3} mb="md">System Health</Title>
          <Text size="sm" c="dimmed">All systems operational across North, South, and Central campuses.</Text>
        </Card>
      </Stack>
    ),
  },
};

export const Landing: Story = {
  args: {
    variant: 'landing',
    children: (
      <Box style={{ paddingTop: 80 }}>
        <Stack align="center" gap="xl" py={120}>
          <Title order={1} size={60} style={{ textAlign: 'center', lineHeight: 1.1 }}>
            Modern Academic <Text inherit component="span" color="brand">Management</Text>
          </Title>
          <Text size="xl" c="dimmed" maw={600} style={{ textAlign: 'center' }}>
            Empower your institution with an all-in-one portal for admissions, student data, and academic tracking.
          </Text>
          <Group gap="md">
            <Button size="xl" color="brand">Get Started</Button>
            <Button size="xl" variant="outline" color="brand">Learn More</Button>
          </Group>
        </Stack>
        
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={40} py={100}>
          <Stack align="center">
            <ThemeIcon size={60} radius="xs" color="brand" variant="light">
              <IconGauge size={30} />
            </ThemeIcon>
            <Text fw={700} size="lg">High Performance</Text>
            <Text ta="center" c="dimmed">Built with modern architecture for sub-second responses even with massive data.</Text>
          </Stack>
          <Stack align="center">
            <ThemeIcon size={60} radius="xs" color="brand" variant="light">
              <IconFingerprint size={30} />
            </ThemeIcon>
            <Text fw={700} size="lg">Secure by Default</Text>
            <Text ta="center" c="dimmed">Enterprise-grade security with advanced encryption and role-based access control.</Text>
          </Stack>
          <Stack align="center">
            <ThemeIcon size={60} radius="xs" color="brand" variant="light">
              <IconActivity size={30} />
            </ThemeIcon>
            <Text fw={700} size="lg">Real-time Analytics</Text>
            <Text ta="center" c="dimmed">Get instant insights into student enrollment and academic progress.</Text>
          </Stack>
        </SimpleGrid>
      </Box>
    ),
  },
};
