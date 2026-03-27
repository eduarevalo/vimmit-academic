import { Container, SimpleGrid, Text, Title, Paper, Stack, useMantineTheme, Box, Overlay } from '@mantine/core';
import { IconTargetArrow, IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const BG_MISSION = '/assets/bg_career.png';

export function MissionVision() {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  return (
    <Box 
        style={{ 
            position: 'relative',
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `url(${BG_MISSION})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '100px 0'
        }}
    >
      <Overlay color="#000" opacity={0.6} zIndex={1} />
      
      <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50}>
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Paper 
                    p={40} 
                    radius="lg" 
                    style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        height: '100%'
                    }}
                >
                    <Stack gap="xl">
                        <Box color="white" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Box 
                                p={12} 
                                style={{ 
                                    backgroundColor: theme.colors.brand[6],
                                    borderRadius: '50%',
                                    display: 'flex',
                                    color: 'white'
                                }}
                            >
                                <IconTargetArrow size={32} />
                            </Box>
                            <Title order={2} c="white" size={32} fw={900}>{t('aboutPage.mission.titleText')}</Title>
                        </Box>
                        
                        <Stack gap="md">
                            <Text c="white" size="lg" style={{ lineHeight: 1.8 }}>
                                {t('aboutPage.mission.p1')}
                            </Text>
                            <Text c="white" size="lg" style={{ lineHeight: 1.8 }}>
                                {t('aboutPage.mission.p2')}
                            </Text>
                        </Stack>
                    </Stack>
                </Paper>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Paper 
                    p={40} 
                    radius="lg" 
                    style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        height: '100%'
                    }}
                >
                    <Stack gap="xl">
                        <Box color="white" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Box 
                                p={12} 
                                style={{ 
                                    backgroundColor: theme.colors.teal[6],
                                    borderRadius: '50%',
                                    display: 'flex',
                                    color: 'white'
                                }}
                            >
                                <IconEye size={32} />
                            </Box>
                            <Title order={2} c="white" size={32} fw={900}>{t('aboutPage.vision.titleText')}</Title>
                        </Box>
                        
                        <Stack gap="md">
                            <Text c="white" size="lg" style={{ lineHeight: 1.8 }}>
                                {t('aboutPage.mission.p3')}
                            </Text>
                            <Text c="white" size="lg" style={{ lineHeight: 1.8 }}>
                                {t('aboutPage.vision.text')}
                            </Text>
                        </Stack>
                    </Stack>
                </Paper>
            </motion.div>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
