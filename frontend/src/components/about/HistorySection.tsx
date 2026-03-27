import { Container, Text, Title, Stack, Box, useMantineTheme, Image, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const BG_HISTORY = '/assets/bg_academic.png';

export function HistorySection() {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  return (
    <Box py="100px">
      <Container size="lg">
        <Stack gap={80}>
          {/* Parrafo 1 */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50} align="center">
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
                    Nuestros Orígenes
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
                <Image 
                    src={BG_HISTORY} 
                    radius="lg" 
                    shadow="xl"
                    style={{ position: 'relative', zIndex: 1 }}
                />
              </Box>
            </motion.div>
          </SimpleGrid>

          {/* Parrafo 2 & 3 */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50} align="center">
            <Box visibleFrom="md">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <Image 
                        src="/assets/bg_career.png" 
                        radius="lg" 
                        shadow="xl"
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
                    radius="md" 
                    style={{ 
                        backgroundColor: theme.colors.brand[0],
                        borderLeft: `5px solid ${theme.colors.brand[6]}`
                    }}
                >
                    <Text fw={700} italic size="lg" c="brand.9">
                        "Transformando vidas a través del conocimiento y el servicio regional."
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
