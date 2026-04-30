import { EnrollmentWizard } from '../components/administrative/EnrollmentWizard';
import { Container, Stack, Box } from '@mantine/core';

export function AdmissionsPage() {
  return (
    <>
    <Container size="lg" py={80}>
      <Stack gap="xl">
        <EnrollmentWizard />
      </Stack>
    </Container>
    </>
  );
}
