import { Stack, Title, Grid, Text, Divider, Box, Badge, Group } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { EnrollmentForm, Campus, Program } from './types';

interface StepReviewProps {
  form: EnrollmentForm;
  campuses: Campus[];
  programs: Program[];
  uploadedFiles: Record<string, File>;
}

export function StepReview({ 
  form, 
  campuses, 
  programs, 
  uploadedFiles 
}: StepReviewProps) {
  const { t } = useTranslation();
  
  const selectedProgram = programs.find(p => p.id === form.values.programId);

  return (
    <Stack gap="xl" w="100%">
      <Title order={2} ta="center" mt="xl" mb="xl">{t('registration.steps.review')}</Title>
      
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>{t('registration.fields.fullName')}</Text>
          <Text fw={500}>{form.values.fullName}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>{t('registration.fields.email')}</Text>
          <Text fw={500}>{form.values.email}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 12 }}>
          <Divider />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>{t('registration.fields.campus')}</Text>
          <Text fw={500}>{campuses.find(c => c.id === form.values.campusId)?.name}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>{t('registration.fields.program')}</Text>
          <Text fw={500}>{selectedProgram?.name}</Text>
        </Grid.Col>
      </Grid>

      <Box mt="md">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1} mb="xs">{t('registration.steps.docsUploaded')}</Text>
        <Group gap="xs">
          {Object.keys(uploadedFiles).map(docName => (
            <Badge key={docName} variant="light" color="green" leftSection={<IconCheck size={10} />}>
              {docName}
            </Badge>
          ))}
        </Group>
      </Box>
    </Stack>
  );
}
