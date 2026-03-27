import { Container, Title, Text, Stack, Box, SimpleGrid, Paper, ThemeIcon, useMantineTheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconUsers, IconTrophy, IconMapPin, IconLeaf } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export function ImpactPage() {
  const { t } = useTranslation();
  const theme = useMantineTheme();

  const impactStats = [
    { icon: IconUsers, value: t('impactPage.stats.graduates'), label: t('impactPage.stats.graduatesLabel'), color: 'blue' },
    { icon: IconTrophy, value: t('impactPage.stats.yearsExcelence.value'), label: t('impactPage.stats.yearsExcelence.label'), color: 'yellow' },
    { icon: IconMapPin, value: t('impactPage.stats.regionalCampuses.value'), label: t('impactPage.stats.regionalCampuses.label'), color: 'red' },
    { icon: IconLeaf, value: t('impactPage.stats.activeStudents'), label: t('impactPage.stats.activeLabel'), color: 'green' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box py="80px" style={{ backgroundColor: theme.colors.brand[0] }}>
        <Container size="lg">
          <Stack gap="md" align="center" ta="center">
            <Title order={1} size={50} fw={900}>
              {t('impactPage.title')}
            </Title>
            <Text size="xl" c="dimmed" maw={700}>
              {t('impactPage.subtitle')}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py="80px">
        <Stack gap={60}>
          {/* Intro */}
          <Paper p="xl" radius="lg" withBorder bg="gray.0">
            <Text size="lg" style={{ lineHeight: 1.8 }}>
              {t('impactPage.intro')}
            </Text>
          </Paper>

          {/* Stats Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper p="xl" radius="md" withBorder ta="center" shadow="sm">
                  <ThemeIcon size="60px" radius="md" variant="light" color={stat.color} mb="md">
                    <stat.icon size={34} stroke={1.5} />
                  </ThemeIcon>
                  <Text size="32px" fw={900} mb="4px">{stat.value}</Text>
                  <Text size="sm" c="dimmed" fw={600}>{stat.label}</Text>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>

          {/* Stories Section */}
          <Stack gap="xl">
            <Title order={2} ta="center" size={36}>{t('impactPage.stories.title')}</Title>
            
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Paper p="xl" radius="lg" withBorder shadow="md" style={{ height: '100%', borderLeft: `8px solid ${theme.colors.brand[6]}` }}>
                  <Title order={3} mb="md" c="brand.8">{t('impactPage.stories.naya.title')}</Title>
                  <Text size="lg" lh={1.8}>
                    {t('impactPage.stories.naya.text')}
                  </Text>
                </Paper>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Paper p="xl" radius="lg" withBorder shadow="md" style={{ height: '100%', borderLeft: `8px solid ${theme.colors.teal[6]}` }}>
                  <Title order={3} mb="md" c="teal.8">{t('impactPage.stories.communities.title')}</Title>
                  <Text size="lg" lh={1.8}>
                    {t('impactPage.stories.communities.text')}
                  </Text>
                </Paper>
              </motion.div>
            </SimpleGrid>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
