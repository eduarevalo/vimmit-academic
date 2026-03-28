import { useState, useEffect } from 'react';
import { Modal, TextInput, MultiSelect, Button, Stack, Text, Box, Alert, Skeleton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRegistrationModal } from '../hooks/useRegistrationModal';
import { useInstitution } from '../hooks/useInstitution';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

import { API_BASE_URL } from '../config';

interface Program {
  id: string;
  name: string;
}

export function RegistrationModal() {
  const { t } = useTranslation();
  const { isOpen, close } = useRegistrationModal();
  const { slug } = useInstitution();
  
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    programs: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingPrograms(true);
      fetch(`${API_BASE_URL}/api/v1/academic/programs/public/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPrograms(data);
          }
        })
        .catch((err) => {
          console.error('Error fetching programs:', err);
        })
        .finally(() => setLoadingPrograms(false));
    }
  }, [isOpen, slug]);

  const programOptions = programs.map(p => ({
    value: p.id,
    label: p.name
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/administration/registration-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone || null,
          interests: formData.programs,
          tenantId: '00000000-0000-0000-0000-000000000000' // Default tenant or should we use one from data?
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register interest');
      }

      setSuccess(true);
      setFormData({ fullName: '', email: '', phone: '', programs: [] });
      setTimeout(() => {
        close();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(t('registration.error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      {success ? (
        <Stack align="center" py="xl">
          <IconCheck size={48} color="var(--mantine-color-green-6)" />
          <Text ta="center" fw={500}>{t('registration.success')}</Text>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Box mb="xl">
            <Text size="sm" c="dimmed" mb="xs">
              {t('registration.subtitle')}
            </Text>
          </Box>

          <Stack gap="md">
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" radius="md">
                {error}
              </Alert>
            )}
            
            <TextInput 
              label={t('registration.fields.fullName')} 
              placeholder="Juan Pérez" 
              required 
              radius="md"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <TextInput 
              label={t('registration.fields.email')} 
              placeholder="juan.perez@email.com" 
              type="email"
              required 
              radius="md"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextInput 
              label={t('registration.fields.phone')} 
              placeholder="+57 300 123 4567" 
              radius="md"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {loadingPrograms ? (
              <Stack gap="xs">
                <Text size="sm" fw={500}>{t('registration.fields.program')}</Text>
                <Skeleton h={42} radius="md" />
              </Stack>
            ) : (
              <MultiSelect
                label={t('registration.fields.program')}
                placeholder={t('registration.fields.programPlaceholder')}
                data={programOptions}
                radius="md"
                required
                value={formData.programs}
                onChange={(val) => setFormData({ ...formData, programs: val })}
                clearable
                searchable
                hidePickedOptions
              />
            )}
            
            <Box mt="md">
              <Button 
                type="submit" 
                fullWidth 
                size="md" 
                color="brand" 
                radius="xl"
                loading={loading}
              >
                {t('registration.submit')}
              </Button>
              <Text size="xs" c="dimmed" ta="center" mt="sm">
                {t('registration.disclaimer')}
              </Text>
            </Box>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

