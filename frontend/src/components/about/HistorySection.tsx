import { Container, Text, Title, Stack, Box, useMantineTheme, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ResponsiveImage } from '../common/ResponsiveImage';

const BG_HISTORY_BASE = '/assets/aseder_graduation';

export function HistorySection() {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  return (
    <Box py="100px">
      <Container size="lg">
        <Stack gap={80}>
          {/* Parrafo 1 */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50} style={{ alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Stack gap="xl">
                <Text 
                    variant="gradient" 
                    gradient={{ from: 'brand.6', to: 'brand.9' }} 
                    fw={700} 
                    tt="uppercase" 
                    lts={2}
                >
                    {t('aboutPage.history.tag')}
                </Text>
                <Title order={2} size={42} fw={900} style={{ lineHeight: 1.1 }}>
                    {t('aboutPage.history.title')}
                </Title>
                <Text size="lg" style={{ lineHeight: 1.8 }} c="dimmed">
                    {t('aboutPage.history.p1')}
                </Text>
              </Stack>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Box style={{ position: 'relative' }}>
                <Box 
                    style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        right: '-20px', 
                        width: '100%', 
                        height: '100%', 
                        border: `2px solid ${theme.colors.brand[1]}`,
                        borderRadius: theme.radius.lg,
                        zIndex: 0
                    }} 
                />
                <ResponsiveImage 
                    srcSetBase={BG_HISTORY_BASE}
                    fallbackExt="png"
                    alt={t('aboutPage.history.title')}

                    radius="lg" 
                    style={{ position: 'relative', zIndex: 1, boxShadow: theme.shadows.xl }}
                />
              </Box>
            </motion.div>
          </SimpleGrid>

          {/* Parrafo 2 & 3 */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50} style={{ alignItems: 'center' }}>
            <Box>
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <ResponsiveImage 
                        srcSetBase="/assets/aseder_medical"
                        fallbackExt="png"
                        alt={t('aboutPage.history.medicalAlt')}
                        radius="lg" 
                        style={{ boxShadow: theme.shadows.xl }}
                    />
                </motion.div>
            </Box>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Stack gap="xl">
                <Text size="lg" style={{ lineHeight: 1.8 }} c="dimmed">
                    {t('aboutPage.history.p2')}
                </Text>
                <Text size="lg" style={{ lineHeight: 1.8 }} c="dimmed">
                    {t('aboutPage.history.p3')}
                </Text>
                <Box 
                    p="xl" 
                    style={{ 
                        backgroundColor: theme.colors.brand[0],
                        borderLeft: `5px solid ${theme.colors.brand[6]}`,
                        borderRadius: theme.radius.md
                    }}
                >
                    <Text fw={700} fs="italic" size="lg" c="brand.9">
                        "{t('aboutPage.history.quote')}"
                    </Text>
                </Box>
              </Stack>
            </motion.div>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
