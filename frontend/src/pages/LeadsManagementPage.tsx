import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, Stack, Text, Badge, Table,
  Paper, Group
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconPhone, IconMail, IconUser } from '@tabler/icons-react';

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
  tenantId: string;
  createdAt: string;
  updatedAt: string;
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

export function LeadsManagementPage() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const fetchLeads = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/administration/registration-intents`, {
        headers: authHeaders
      });
      if (res.ok) setLeads(await res.json());
    } catch (error) {
      console.error('Error fetching leads:', error);
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
    fetchLeads(); 
  }, [token]);

  useEffect(() => {
    if (leads.length > 0) {
      // Fetch members for the first lead's tenant to populate names
      // In a real scenario, we'd handle multiple tenants better
      fetchMembers(leads[0].tenantId);
    }
  }, [leads]);

  const getMemberName = (id: string | null) => {
    if (!id) return t('portal.leads.form.unassigned');
    const member = members.find(m => m.user_id === id);
    if (member) return `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email;
    return t('portal.leads.form.unassigned');
  };

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={t('portal.leads.title')}
          subtitle={t('portal.leads.subtitle')}
        />

        {leads.length > 0 ? (
          <Paper withBorder radius="xs" style={{ overflow: 'auto' }}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('portal.leads.list.status')}</Table.Th>
                  <Table.Th>{t('portal.leads.list.name')}</Table.Th>
                  <Table.Th>{t('portal.leads.list.contact')}</Table.Th>
                  <Table.Th>{t('portal.leads.list.interests')}</Table.Th>
                  <Table.Th>{t('portal.leads.list.assigned')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {leads.map((lead) => (
                  <Table.Tr 
                    key={lead.id} 
                    onClick={() => navigate(`/portal/administrative/leads/${lead.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Table.Td>
                      <Badge color={STATUS_COLORS[lead.status] || 'gray'} variant="light">
                        {t(`portal.leads.status.${lead.status}`)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{lead.fullName}</Text>
                      <Text size="xs" c="dimmed">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <IconMail size={14} style={{ opacity: 0.5 }} />
                        <Text size="sm">{lead.email}</Text>
                      </Group>
                      {lead.phone && (
                        <Group gap={4}>
                          <IconPhone size={14} style={{ opacity: 0.5 }} />
                          <Text size="sm">{lead.phone}</Text>
                        </Group>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        {(lead.interestsNames?.length ? lead.interestsNames : lead.interests).map(i => (
                          <Text key={i} size="xs" c="dimmed">• {i}</Text>
                        ))}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      {lead.assigned_to ? (
                        <Group gap={4}>
                          <IconUser size={14} style={{ opacity: 0.5 }} />
                          <Text size="sm">
                            {lead.assigned_to === user?.id ? (t('common.me') || 'Me') : getMemberName(lead.assigned_to)}
                          </Text>
                        </Group>
                      ) : (
                        <Text size="xs" fs="italic" c="dimmed">{t('portal.leads.form.unassigned')}</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        ) : (
          <Paper withBorder p="xl" radius="xs" ta="center">
            <Text c="dimmed">{t('portal.leads.list.empty')}</Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
