import { Container, SimpleGrid, Text, Title, Paper, Stack, useMantineTheme, Box } from '@mantine/core';
import { IconUsers, IconCertificate, IconSchool, IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function StatsSection() {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  const stats = [
    {
      icon: IconHistory,
      value: t('aboutPage.statsSection.items.years.value'),
      label: t('aboutPage.statsSection.items.years.label'),
      description: t('aboutPage.statsSection.items.years.desc'),
      color: 'blue'
    },
    {
      icon: IconUsers,
      value: t('aboutPage.statsSection.items.graduates.value'),
      label: t('aboutPage.statsSection.items.graduates.label'),
      description: t('aboutPage.statsSection.items.graduates.desc'),
      color: 'teal'
    },
    {
      icon: IconSchool,
      value: t('aboutPage.statsSection.items.programs.value'),
      label: t('aboutPage.statsSection.items.programs.label'),
      description: t('aboutPage.statsSection.items.programs.desc'),
      color: 'orange'
    },
    {
      icon: IconCertificate,
      value: t('aboutPage.statsSection.items.commitment.value'),
      label: t('aboutPage.statsSection.items.commitment.label'),
      description: t('aboutPage.statsSection.items.commitment.desc'),
      color: 'red'
    }
  ];

  return (
    <Box 
        py="100px" 
        style={{ 
            backgroundColor: theme.colors.gray[0],
            backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.colors.gray[2]} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
        }}
    >
      <Container size="lg">
        <Stack align="center" mb="60px" gap="xs">
            <Text 
                variant="gradient" 
                gradient={{ from: 'brand.6', to: 'brand.9' }} 
                fw={700} 
                tt="uppercase" 
                lts={2}
            >
                {t('aboutPage.statsSection.tag')}
            </Text>
            <Title order={2} size={48} fw={900} ta="center" style={{ letterSpacing: '-1px' }}>
                {t('aboutPage.statsSection.title')}
            </Title>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={30}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Paper 
                p="xl" 
                radius="md" 
                withBorder 
                shadow="md"
                style={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    border: '1px solid ' + theme.colors.gray[2]
                 }}
                 onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-10px)';
                     e.currentTarget.style.boxShadow = theme.shadows.xl;
                     e.currentTarget.style.borderColor = theme.colors[stat.color][2];
                 }}
                 onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = theme.shadows.md;
                     e.currentTarget.style.borderColor = theme.colors.gray[2];
                 }}
              >
                <Stack align="center" gap="sm">
                  <Box 
                    p="15px" 
                    style={{ 
                        backgroundColor: theme.colors[stat.color][0],
                        color: theme.colors[stat.color][6],
                        borderRadius: theme.radius.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                  >
                    <stat.icon size={32} stroke={1.5} />
                  </Box>
                  <Text size="36px" fw={900} style={{ lineHeight: 1 }}>{stat.value}</Text>
                  <Text fw={700} size="lg" ta="center">{stat.label}</Text>
                  <Text size="sm" ta="center" c="dimmed">{stat.description}</Text>
                </Stack>
              </Paper>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
