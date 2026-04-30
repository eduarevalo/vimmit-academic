import { Container, Title, Text, Stack, Box, SimpleGrid, Paper, List, Image, Badge, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconCheck, IconTarget, IconBriefcase, IconCertificate } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { HeroSection, Button as VimmitButton } from '@ux/index';

export function ProgramDetailPage() {
    const { programId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Map the program ID to the translation key
    const programData = t(`technicalPage.programs.${programId}`, { returnObjects: true }) as any;

    if (!programData || typeof programData === 'string') {
        return (
            <Container size="lg" py={100}>
                <Stack align="center">
                    <Title>{t('technicalPage.detail.notFound')}</Title>
                    <Button onClick={() => navigate('/programs')}>{t('technicalPage.detail.back')}</Button>
                </Stack>
            </Container>
        );
    }

    return (
        <Box>
            <HeroSection 
                title={programData.title}
                subtitle={programData.desc}
                image={programData.image}
                ctaPrimary={{ 
                    label: t('technicalPage.detail.back'), 
                    onClick: () => navigate('/programs') 
                }}
            />

            <Container size="lg" py={80}>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60}>
                    <Stack gap={40}>
                        {/* Objectives */}
                        <Box>
                            <Group gap="xs" mb="md">
                                <IconTarget size={28} color="var(--mantine-color-brand-6)" />
                                <Title order={2} size="h3" fw={800}>{t('technicalPage.detail.objectivesTitle')}</Title>
                            </Group>
                            <Paper p="xl" radius="xs" withBorder bg="gray.0">
                                <Text size="lg" lh={1.7}>
                                    {programData.objectives}
                                </Text>
                            </Paper>
                        </Box>

                        {/* Professional Profile */}
                        <Box>
                            <Group gap="xs" mb="md">
                                <IconBriefcase size={28} color="var(--mantine-color-brand-6)" />
                                <Title order={2} size="h3" fw={800}>{t('technicalPage.detail.profileTitle')}</Title>
                            </Group>
                            <Text size="lg" lh={1.7} c="dimmed">
                                {programData.profile}
                            </Text>
                            <List 
                                mt="xl" 
                                spacing="sm" 
                                center 
                                icon={<IconCheck size={20} color="var(--mantine-color-brand-6)" />}
                            >
                                <List.Item>{t('technicalPage.detail.check1')}</List.Item>
                                <List.Item>{t('technicalPage.detail.check2')}</List.Item>
                                <List.Item>{t('technicalPage.detail.check3')}</List.Item>
                            </List>
                        </Box>
                    </Stack>

                    <Stack gap={40}>
                        {/* Curriculum / Structure */}
                        <Box>
                            <Group gap="xs" mb="md">
                                <IconCertificate size={28} color="var(--mantine-color-brand-6)" />
                                <Title order={2} size="h3" fw={800}>{t('technicalPage.detail.curriculumTitle')}</Title>
                            </Group>
                            <Stack gap="md">
                                {programData.levels.map((level: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <Paper p="lg" radius="xs" withBorder style={{ borderLeft: '4px solid var(--mantine-color-brand-6)' }}>
                                            <Text fw={700} size="lg">{level}</Text>
                                        </Paper>
                                    </motion.div>
                                ))}
                            </Stack>
                        </Box>

                        {/* CTA Section */}
                        <Paper p={40} radius="xs" bg="brand.6" c="white" shadow="xl">
                            <Stack align="center" ta="center" gap="lg">
                                <Title order={2} size="h2" fw={900}>{t('technicalPage.detail.ctaTitle')}</Title>
                                <Text size="lg" opacity={0.9}>
                                    {t('technicalPage.detail.ctaText')}
                                </Text>
                                <VimmitButton size="xl" radius="xs" variant="white" color="brand.6" fullWidth>
                                    {t('technicalPage.detail.ctaButton')}
                                </VimmitButton>
                            </Stack>
                        </Paper>
                    </Stack>
                </SimpleGrid>
            </Container>
        </Box>
    );
}
