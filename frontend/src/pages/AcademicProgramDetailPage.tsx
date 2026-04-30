import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Tabs, 
  Paper, 
  LoadingOverlay,
  Button
} from '@mantine/core';
import { IconSettings, IconCurrencyDollar, IconArrowLeft } from '@tabler/icons-react';

import { PageHeader } from '../components/common/PageHeader';
import { ProgramForm } from '../components/portal/ProgramForm';
import { ProgramCostsList } from '../components/portal/ProgramCostsList';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';

export function AcademicProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();
  
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(id !== 'new');

  useEffect(() => {
    if (id === 'new') {
      setProgram(null);
      setLoading(false);
      return;
    }

    const fetchProgram = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/v1/academic/programs/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setProgram(await res.json());
        } else {
          // Instead of crashing, redirect back if program not found
          navigate('/portal/academic/programs');
        }
      } catch (error) {
        console.error('Error fetching program:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [id, token, navigate]);

  const handleSuccess = (newId?: string) => {
    if (id === 'new' && newId) {
      navigate(`/portal/academic/programs/${newId}`);
    } else {
      navigate('/portal/academic/programs');
    }
  };

  return (
    <Container size="lg" py={40}>
      <PageHeader 
        title={id === 'new' ? t('portal.programsManagement.create') : t('portal.programsManagement.edit')}
        subtitle={program ? program.name : ''}
        actions={
          <Button 
            variant="default" 
            leftSection={<IconArrowLeft size={16} />} 
            onClick={() => navigate('/portal/academic/programs')}
          >
            {t('common.cancel', 'Volver')}
          </Button>
        }
      />

      <Paper withBorder p="md" radius="xs" pos="relative" mt="xl">
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        
        {id === 'new' ? (
           <ProgramForm initialValues={null} onSuccess={handleSuccess} />
        ) : program ? (
          <Tabs defaultValue="general">
            <Tabs.List>
              <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
                {t('common.general', 'General')}
              </Tabs.Tab>
              <Tabs.Tab value="costs" leftSection={<IconCurrencyDollar size={16} />}>
                {t('portal.programsManagement.costs.title', 'Costos')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general" pt="md">
              <ProgramForm
                initialValues={program}
                onSuccess={handleSuccess}
              />
            </Tabs.Panel>

            <Tabs.Panel value="costs" pt="sm">
              <ProgramCostsList programId={program.id} tenantId={program.tenant_id} />
            </Tabs.Panel>
          </Tabs>
        ) : null}
      </Paper>
    </Container>
  );
}
