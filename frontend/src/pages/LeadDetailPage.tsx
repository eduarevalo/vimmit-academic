import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, Stack, Text, Button, Badge, Paper, 
  Group, Grid, Select, Textarea, Timeline, Alert, Loader
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconPhone, IconMail, IconUser, IconInfoCircle, 
  IconCheck, IconSettings, IconNote, IconUserPlus, IconChevronLeft 
} from '@tabler/icons-react';

import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/common/PageHeader';
import { API_BASE_URL } from '../config';

interface Lead {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  interests: string[];
  interestsNames?: string[];
  status: string;
  assigned_to: string | null;
  notes: string | null;
  interactions: Interaction[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

interface Interaction {
  id: string;
  user_id: string | null;
  interaction_type: string;
  details: string;
  created_at: string;
}

interface Member {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'gray',
  CONTACTED: 'blue',
  IN_PROGRESS: 'yellow',
  CONVERTED: 'green',
  LOST: 'red',
};

export function LeadDetailPage() {
  const { leadId } = useParams();
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [successAlert, setSuccessAlert] = useState<boolean>(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const form = useForm({
    initialValues: {
      status: '',
      assigned_to: null as string | null,
      notes: ''
    }
  });

  const fetchLead = async () => {
    if (!token || !leadId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/administration/registration-intents/${leadId}`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setLead(data);
        form.setValues({
          status: data.status,
          assigned_to: data.assigned_to,
          notes: ''
        });
        fetchMembers(data.tenantId);
      } else {
        setErrorAlert(t('portal.leads.error.notFound') || 'Lead not found');
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      setErrorAlert(t('common.error.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (tenantId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/identity/tenants/${tenantId}/members`, {
        headers: authHeaders
      });
      if (res.ok) setMembers(await res.json());
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [token, leadId]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!lead) return;
    const payload = {
      ...values,
      assigned_to: values.assigned_to === '' ? null : values.assigned_to
    };
    
    try {
      const res = await fetch(`${API_BASE_URL}/v1/administration/registration-intents/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Update failed");
      
      setSuccessAlert(true);
      fetchLead(); // Refresh the lead data to show the new interaction
      
      setTimeout(() => {
        setSuccessAlert(false);
      }, 3000);

    } catch (e) {
      setErrorAlert(t('common.error.unknown'));
    }
  };

  const getMemberName = (id: string | null) => {
    if (!id) return t('portal.leads.form.unassigned');
    const member = members.find(m => m.user_id === id);
    if (member) return `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email;
    return t('portal.leads.form.unassigned');
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE': return <IconSettings size={14} />;
      case 'ASSIGNMENT': return <IconUserPlus size={14} />;
      case 'NOTE': return <IconNote size={14} />;
      default: return <IconInfoCircle size={14} />;
    }
  };

  const renderInteractionDetails = (interaction: Interaction) => {
    try {
      const details = JSON.parse(interaction.details);
      
      if (interaction.interaction_type === 'STATUS_CHANGE') {
        return t('portal.leads.timeline.statusChanged', { 
          old: t(`portal.leads.status.${details.old}`), 
          new: t(`portal.leads.status.${details.new}`) 
        });
      }
      
      if (interaction.interaction_type === 'ASSIGNMENT') {
        if (details.assigned_to) {
          return t('portal.leads.timeline.assigned', { 
            name: getMemberName(details.assigned_to) 
          });
        }
        return t('portal.leads.timeline.unassigned');
      }
      
      if (interaction.interaction_type === 'NOTE') {
        return details.note;
      }
      
      return interaction.details;
    } catch (e) {
      // Fallback for old string-based interactions
      return interaction.details;
    }
  };

  if (loading) {
    return (
      <Container size="lg" py={40} ta="center">
        <Loader size="xl" />
      </Container>
    );
  }

  if (!lead) {
    return (
      <Container size="xl" py={40}>
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          {errorAlert || t('portal.leads.error.notFound')}
        </Alert>
        <Button variant="subtle" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate('/portal/administrative/leads')} mt="md">
           {t('common.back') || 'Go Back'}
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={lead.fullName}
          subtitle={t('portal.leads.subtitle')}
          withBackButton
          actions={
            <Badge color={STATUS_COLORS[lead.status] || 'gray'} variant="filled" size="lg">
              {t(`portal.leads.status.${lead.status}`)}
            </Badge>
          }
        />

        {errorAlert && (
          <Alert icon={<IconInfoCircle size={16} />} title={t('common.error.title')} color="red" withCloseButton onClose={() => setErrorAlert(null)}>
            {errorAlert}
          </Alert>
        )}

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper withBorder p="xl" radius="xs">
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <Text fw={600} size="sm" tt="uppercase" c="dimmed">{t('portal.leads.form.details') || 'Lead Details'}</Text>
                  
                  <Paper bg="gray.0" p="md" radius="xs">
                    <Stack gap="xs">
                      <Group gap={8}>
                        <IconMail size={16} style={{ opacity: 0.5 }} />
                        <Text size="sm">{lead.email}</Text>
                      </Group>
                      {lead.phone && (
                        <Group gap={8}>
                          <IconPhone size={16} style={{ opacity: 0.5 }} />
                          <Text size="sm">{lead.phone}</Text>
                        </Group>
                      )}
                      <Group gap={8}>
                        <IconUser size={16} style={{ opacity: 0.5 }} />
                        <Text size="sm" fw={500}>{t('portal.leads.list.assigned')}: {getMemberName(lead.assigned_to)}</Text>
                      </Group>
                    </Stack>
                  </Paper>

                  <Select
                    label={t('portal.leads.form.status')}
                    data={Object.keys(STATUS_COLORS).map(k => ({ value: k, label: t(`portal.leads.status.${k}`) }))}
                    required
                    {...form.getInputProps('status')}
                  />
                  <Select
                    label={t('portal.leads.form.assignedTo')}
                    placeholder={t('portal.leads.form.unassigned')}
                    data={[
                      { value: '', label: t('portal.leads.form.unassigned') },
                      ...members.map(m => ({
                        value: m.user_id,
                        label: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email
                      }))
                    ]}
                    {...form.getInputProps('assigned_to')}
                  />
                  <Textarea
                    label={t('portal.leads.form.notes')}
                    placeholder={t('portal.leads.form.notesPlaceholder')}
                    minRows={4}
                    {...form.getInputProps('notes')}
                  />

                  {successAlert && (
                    <Alert icon={<IconCheck size={16} />} color="green" radius="xs">
                      {t('portal.leads.form.save')}
                    </Alert>
                  )}

                  <Group justify="flex-end" mt="md">
                    <Button type="submit" color="brand" loading={loading}>{t('portal.leads.form.save')}</Button>
                  </Group>
                </Stack>
              </form>
            </Paper>

            <Paper withBorder p="xl" radius="xs" mt="xl">
              <Text fw={600} size="sm" tt="uppercase" c="dimmed" mb="md">{t('portal.leads.list.interests')}</Text>
              <Stack gap={8}>
                {(lead.interestsNames?.length ? lead.interestsNames : lead.interests).map(i => (
                  <Badge key={i} variant="light" color="gray" fullWidth style={{ justifyContent: 'flex-start' }}>{i}</Badge>
                ))}
                {lead.interests.length === 0 && <Text size="sm" c="dimmed italic">{t('common.none') || 'None'}</Text>}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper withBorder p="xl" radius="xs">
              <Text fw={600} mb="xl" size="sm" tt="uppercase" c="dimmed">
                {t('portal.leads.timeline.interactionHistory') || t('portal.leads.form.interactionHistory')}
              </Text>
              
              {lead.interactions && lead.interactions.length > 0 ? (
                <Timeline active={lead.interactions.length} bulletSize={32} lineWidth={2}>
                  {lead.interactions.map((interaction) => (
                    <Timeline.Item 
                      key={interaction.id}
                      title={t(`portal.leads.timeline.title_${interaction.interaction_type}`) || interaction.interaction_type}
                      bullet={getInteractionIcon(interaction.interaction_type)}
                    >
                      <Text size="sm" mt={4}>{renderInteractionDetails(interaction)}</Text>
                      <Text size="xs" mt={4} c="dimmed">
                        {getMemberName(interaction.user_id)} • {new Date(interaction.created_at).toLocaleString()}
                      </Text>
                    </Timeline.Item>
                  ))}
                  <Timeline.Item 
                    title={t('portal.leads.timeline.created') || 'Lead Created'} 
                    bullet={<IconUser size={16} />}
                  >
                    <Text size="xs" mt={4} c="dimmed">
                      {new Date(lead.createdAt).toLocaleString()}
                    </Text>
                  </Timeline.Item>
                </Timeline>
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  {t('portal.leads.form.noInteractions')}
                </Text>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
