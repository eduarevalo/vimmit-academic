import { Modal, TextInput, Select, Button, Stack, Text, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRegistrationModal } from '../hooks/useRegistrationModal';
// import { useInstitution } from '../hooks/useInstitution'; // This import is not used in the component

export function RegistrationModal() {
  const { t } = useTranslation();
  const { isOpen, close } = useRegistrationModal();

  const programOptions = [
    { value: 'cs', label: t('programs.list.computerScience.title') },
    { value: 'business', label: t('programs.list.business.title') },
    { value: 'env', label: t('programs.list.environmental.title') },
    { value: 'arts', label: t('programs.list.arts.title') },
    { value: 'med', label: t('programs.list.medicine.title') },
    { value: 'law', label: t('programs.list.law.title') },
  ];

  return (
    <Modal 
      opened={isOpen} 
      onClose={close} 
      title={<Text fw={700} size="lg">{t('registration.title')}</Text>}
      radius="lg"
      size="md"
      padding="xl"
      centered
    >
      <Box mb="xl">
        <Text size="sm" c="dimmed" mb="xs">
          {t('registration.subtitle')}
        </Text>
      </Box>

      <Stack gap="md">
        <TextInput 
          label={t('registration.fields.fullName')} 
          placeholder="Juan Pérez" 
          required 
          radius="md"
        />
        <TextInput 
          label={t('registration.fields.email')} 
          placeholder="juan.perez@email.com" 
          required 
          radius="md"
        />
        <TextInput 
          label={t('registration.fields.phone')} 
          placeholder="+57 300 123 4567" 
          radius="md"
        />
        <Select
          label={t('registration.fields.program')}
          placeholder={t('registration.fields.programPlaceholder')}
          data={programOptions}
          radius="md"
          required
        />
        
        <Box mt="md">
          <Button fullWidth size="md" color="brand" radius="xl">
            {t('registration.submit')}
          </Button>
          <Text size="xs" c="dimmed" ta="center" mt="sm">
            {t('registration.disclaimer')}
          </Text>
        </Box>
      </Stack>
    </Modal>
  );
}
