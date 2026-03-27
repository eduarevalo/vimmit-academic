import { Container, Title, Text, Stack, Box, SimpleGrid, Paper, ThemeIcon, useMantineTheme, Image, Overlay, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconStethoscope, IconDental, IconMedicineSyrup, IconBabyCarriage, IconUserCheck, IconMicroscope } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export function TechnicalProgramsPage() {
  const { t } = useTranslation();
  const theme = useMantineTheme();

  const programs = [
    { icon: IconStethoscope, title: t('technicalPage.programs.nursing.title'), desc: t('technicalPage.programs.nursing.desc'), color: 'blue' },
    { icon: IconDental, title: t('technicalPage.programs.oralHealth.title'), desc: t('technicalPage.programs.oralHealth.desc'), color: 'teal' },
    { icon: IconMedicineSyrup, title: t('technicalPage.programs.pharmacy.title'), desc: t('technicalPage.programs.pharmacy.desc'), color: 'red' },
    { icon: IconBabyCarriage, title: t('technicalPage.programs.earlyChildhood.title'), desc: t('technicalPage.programs.earlyChildhood.desc'), color: 'orange' },
    { icon: IconUserCheck, title: t('technicalPage.programs.admin.title'), desc: t('technicalPage.programs.admin.desc'), color: 'gray' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        py="100px" 
        style={{ 
            position: 'relative', 
            backgroundImage: 'url(/assets/aseder_graduation.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            color: 'white'
        }}
      >
        <Overlay color="#000" opacity={0.6} zIndex={1} />
        <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
          <Stack gap="md" align="center" ta="center">
            <Title order={1} size={50} fw={900}>
              {t('technicalPage.title')}
            </Title>
            <Text size="xl" maw={700}>
              {t('technicalPage.subtitle')}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py={80}>
        <Stack gap={80}>
          {/* Clinic Highlight */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="50px">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Image 
                    src="/assets/aseder_medical.png" 
                    radius="lg" 
                />
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Stack gap="xl">
                    <Group gap="xs">
                        <ThemeIcon size={50} radius="md" color="brand.6">
                            <IconMicroscope size={32} />
                        </ThemeIcon>
                        <Title order={2}>{t('technicalPage.clinic.title')}</Title>
                    </Group>
                    <Text size="lg" lh={1.8}>
                        {t('technicalPage.clinic.text')}
                    </Text>
                    <Text size="md" c="dimmed">
                        {t('technicalPage.clinic.secondaryText')}
                    </Text>
                </Stack>
            </motion.div>
          </SimpleGrid>

          {/* Programs Grid */}
          <Stack gap="xl">
            <Title order={2} ta="center" size={36}>{t('technicalPage.offersTitle')}</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                {programs.map((program, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <Paper p="xl" radius="md" withBorder shadow="sm" style={{ height: '100%', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = theme.shadows.md; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadows.sm; }}>
                            <ThemeIcon size="60px" radius="md" variant="light" color={program.color} mb="md">
                                <program.icon size={34} stroke={1.5} />
                            </ThemeIcon>
                            <Title order={3} size="h4" mb="sm">{program.title}</Title>
                            <Text size="sm" c="dimmed" lh={1.6}>
                                {program.desc}
                            </Text>
                        </Paper>
                    </motion.div>
                ))}
            </SimpleGrid>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
