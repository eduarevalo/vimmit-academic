import { useState, useEffect } from 'react';
import { 
  Container, Stack, Card, Text, Group, Tabs, 
  Badge, Button, Table, ActionIcon, LoadingOverlay,
  Box, Grid, Title, Modal, NumberInput, Select, TextInput,
  RingProgress, Center, ThemeIcon, rem, Flex, Paper
} from '@mantine/core';
import { 
  IconUser, IconCoin, IconSchool, IconReceipt,
  IconArrowLeft, IconWallet, IconCreditCard,
  IconCheck
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '@mantine/form';

interface Charge {
  id: string;
  description: string;
  amount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  paid_at: string;
}

interface StudentProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  enrollments: any[];
  financials: {
    tenant_id: string;
    tenant_name: string;
    currency: string;
    total_charged: number;
    total_paid: number;
    balance: number;
    charges: Charge[];
    payments: Payment[];
  }[];
}

export function StudentProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/administrative/students/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchProfile();
    }
  }, [token, id]);

  const paymentForm = useForm({
    initialValues: {
      amount: 0,
      payment_method: 'TRANSFER',
      reference: '',
      notes: ''
    },
    validate: {
      amount: (value) => (value > 0 ? null : t('common.error.requiredField', 'Field required')),
    }
  });

  const handleRegisterPayment = async (values: typeof paymentForm.values, tenantId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/financial/students/${id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify(values)
      });
      if (!response.ok) throw new Error('Failed to register payment');
      
      setPaymentModalOpen(false);
      paymentForm.reset();
      fetchProfile(); // Refresh balance
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (!profile && !loading) {
    return <Container py={40}><Text>Student not found</Text></Container>;
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <Group gap="xs">
          <ActionIcon 
            variant="subtle" 
            color="gray" 
            onClick={() => navigate('/portal/students')}
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Box>
            <Title order={2} style={{ letterSpacing: -0.5 }}>
              {profile?.first_name} {profile?.last_name}
            </Title>
            <Text size="xs" c="dimmed">ID Estudiante: {profile?.id}</Text>
          </Box>
          {profile?.financials?.some(f => Number(f.balance) > 0) && (
            <Badge color="red" variant="light" radius="xs" size="lg">
              {t('portal.students.status.debtBalance', 'Balance Pendiente')}
            </Badge>
          )}
        </Group>

        <Box pos="relative" mih={400}>
          <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} />
          {profile && (
            <Tabs defaultValue="general">
              <Tabs.List mb="md">
                <Tabs.Tab value="general" leftSection={<IconUser size={16} />}>
                  {t('portal.students.tabs.general', 'General Info')}
                </Tabs.Tab>
                <Tabs.Tab value="enrollments" leftSection={<IconSchool size={16} />}>
                  {t('portal.students.tabs.enrollments', 'Enrollments')}
                </Tabs.Tab>
                <Tabs.Tab value="finances" leftSection={<IconCoin size={16} />}>
                  {t('portal.students.tabs.finances', 'Finances')}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="general">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder radius="xs" p="xl">
                      <Title order={4} mb="lg" fw={700}>
                        {t('portal.students.profile.contact', 'Información de Contacto')}
                      </Title>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text c="dimmed">{t('portal.students.profile.email', 'Email')}</Text>
                          <Text fw={500}>{profile.email}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text c="dimmed">{t('portal.students.profile.phone', 'Phone')}</Text>
                          <Text fw={500}>{profile.phone || '-'}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text c="dimmed">{t('portal.students.profile.joined', 'Joined Date')}</Text>
                          <Text fw={500}>{new Date(profile.created_at).toLocaleDateString()}</Text>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>

              <Tabs.Panel value="enrollments">
                <Card withBorder radius="xs" p={0}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('portal.enrollments.list.program', 'Program')}</Table.Th>
                        <Table.Th>{t('portal.enrollments.list.level', 'Level')}</Table.Th>
                        <Table.Th>{t('portal.enrollments.list.institution', 'Institution')}</Table.Th>
                        <Table.Th>{t('portal.enrollments.list.period', 'Period')}</Table.Th>
                        <Table.Th>{t('portal.enrollments.list.status', 'Status')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {profile.enrollments.map(e => (
                        <Table.Tr key={e.id}>
                          <Table.Td>{e.program_name}</Table.Td>
                          <Table.Td>{e.level_name}</Table.Td>
                          <Table.Td>{e.tenant_name}</Table.Td>
                          <Table.Td>{e.calendar_name}</Table.Td>
                          <Table.Td><Badge>{e.status}</Badge></Table.Td>
                        </Table.Tr>
                      ))}
                      {profile.enrollments.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={4} align="center" py="xl">
                            <Text c="dimmed">No enrollments found</Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="finances">
                {profile.financials.map((f, idx) => (
                  <Box key={f.tenant_id} mt={idx > 0 ? 60 : 0}>
                    <Title order={3} mb="lg" c="brand.7" fw={800}>{f.tenant_name}</Title>
                    <Card withBorder radius="xs" p="xl" bg="gray.0" mb="xl">
                      <Grid align="center" gutter="xl">
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Flex justify="center">
                            <RingProgress
                              size={180}
                              thickness={16}
                              roundCaps
                              sections={[
                                { 
                                  value: (Number(f.total_paid) / (Number(f.total_charged) || 1)) * 100, 
                                  color: 'teal' 
                                }
                              ]}
                              label={
                                <Center>
                                  <Stack gap={0} align="center">
                                    <Text size="xl" fw={800} style={{ lineHeight: 1 }}>
                                      {Math.round((Number(f.total_paid) / (Number(f.total_charged) || 1)) * 100)}%
                                    </Text>
                                    <Text size="xs" c="dimmed">{t('common.paid', 'Pagado')}</Text>
                                  </Stack>
                                </Center>
                              }
                            />
                          </Flex>
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, md: 8 }}>
                          <Stack gap="md">
                            <Group grow>
                              <Paper p="md" radius="xs" withBorder shadow="xs">
                                <Text c="dimmed" tt="uppercase" fw={700} size="xs" mb={4}>
                                  {t('portal.students.finances.totalCharged')}
                                </Text>
                                <Text fw={800} size="xl">
                                  {f.currency} {Number(f.total_charged).toLocaleString()}
                                </Text>
                              </Paper>
                              
                              <Paper p="md" radius="xs" withBorder shadow="xs">
                                <Text c="dimmed" tt="uppercase" fw={700} size="xs" mb={4}>
                                  {t('portal.students.finances.totalPaid')}
                                </Text>
                                <Group gap="xs">
                                  <IconCheck size={18} color="var(--mantine-color-teal-6)" />
                                  <Text fw={800} size="xl" c="teal.7">
                                    {f.currency} {Number(f.total_paid).toLocaleString()}
                                  </Text>
                                </Group>
                              </Paper>
                            </Group>

                            <Paper 
                              p="md" radius="xs" withBorder shadow="md"
                              bg={Number(f.balance) > 0 ? 'red.0' : 'teal.0'}
                              style={{ borderLeft: `${rem(6)} solid ${Number(f.balance) > 0 ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-teal-6)'}` }}
                            >
                              <Group justify="space-between">
                                <Stack gap={0}>
                                  <Text c={Number(f.balance) > 0 ? 'red.9' : 'teal.9'} tt="uppercase" fw={700} size="xs">
                                    {t('portal.students.finances.currentBalance')}
                                  </Text>
                                  <Text fw={900} size="2rem" c={Number(f.balance) > 0 ? 'red.8' : 'teal.8'}>
                                    {f.currency} {Number(f.balance).toLocaleString()}
                                  </Text>
                                </Stack>
                                <ThemeIcon 
                                  size={54} radius="xs" 
                                  color={Number(f.balance) > 0 ? 'red' : 'teal'} 
                                  variant="light"
                                >
                                  {Number(f.balance) > 0 ? <IconWallet size={32} /> : <IconCheck size={32} />}
                                </ThemeIcon>
                              </Group>
                            </Paper>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                    </Card>

                    <Group justify="space-between" mt={40} mb="lg">
                      <Title order={4} fw={600} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconReceipt size={20} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                        {t('portal.students.finances.historyTitle', 'Payment History & Charges')} - {f.tenant_name}
                      </Title>
                      <Button 
                        variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}
                        leftSection={<IconCreditCard size={16} />} 
                        radius="xs"
                        onClick={() => {
                          paymentForm.setValues({
                            amount: f.balance,
                            payment_method: 'TRANSFER',
                            reference: '',
                            notes: ''
                          });
                          setSelectedTenantId(f.tenant_id);
                          setPaymentModalOpen(true);
                        }}
                        disabled={f.balance <= 0}
                      >
                        {t('portal.students.finances.registerPaymentBtn', 'Register Payment')}
                      </Button>
                    </Group>

                    <Grid gutter="xl">
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card withBorder radius="xs" p={0} shadow="xs">
                          <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                              <Table.Tr bg="gray.0">
                                <Table.Th colSpan={3}>
                                  <Text fw={600} size="sm">{t('portal.students.finances.chargesTitle', 'Generated Charges')}</Text>
                                </Table.Th>
                              </Table.Tr>
                              <Table.Tr>
                                <Table.Th>{t('portal.students.finances.columns.description', 'Description')}</Table.Th>
                                <Table.Th>{t('portal.students.finances.columns.status', 'Status')}</Table.Th>
                                <Table.Th ta="right">{t('portal.students.finances.columns.amount', 'Amount')}</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {f.charges.map(c => (
                                <Table.Tr key={c.id}>
                                  <Table.Td>
                                    <Text size="sm" fw={500}>{c.description}</Text>
                                    <Text size="xs" c="dimmed">{new Date(c.created_at).toLocaleDateString()}</Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Badge color={c.status === 'PAID' ? 'teal' : c.status === 'PENDING' ? 'red' : 'yellow'} variant="light" size="sm">
                                      {t(`portal.students.finances.status.${c.status}`, c.status)}
                                    </Badge>
                                  </Table.Td>
                                  <Table.Td ta="right">
                                    <Text size="sm" fw={600}>{f.currency} {Number(c.amount).toFixed(2)}</Text>
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                              {f.charges.length === 0 && (
                                <Table.Tr>
                                  <Table.Td colSpan={3} ta="center" py="xl">
                                    <Text c="dimmed" size="sm">{t('common.empty', 'No records found')}</Text>
                                  </Table.Td>
                                </Table.Tr>
                              )}
                            </Table.Tbody>
                          </Table>
                        </Card>
                      </Grid.Col>
                      
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card withBorder radius="xs" p={0} shadow="xs">
                          <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                              <Table.Tr bg="gray.0">
                                <Table.Th colSpan={3}>
                                  <Text fw={600} size="sm">{t('portal.students.finances.paymentsTitle', 'Applied Payments')}</Text>
                                </Table.Th>
                              </Table.Tr>
                              <Table.Tr>
                                <Table.Th>{t('portal.students.finances.columns.date', 'Date')}</Table.Th>
                                <Table.Th>{t('portal.students.finances.columns.method', 'Method')}</Table.Th>
                                <Table.Th ta="right">{t('portal.students.finances.columns.amount', 'Amount')}</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {f.payments.map(p => (
                                <Table.Tr key={p.id}>
                                  <Table.Td>
                                    <Group gap="xs">
                                      <IconCheck size={14} color="var(--mantine-color-teal-6)" />
                                      <Text size="sm" fw={500}>{new Date(p.paid_at).toLocaleDateString()}</Text>
                                    </Group>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm">{t(`portal.students.finances.methods.${p.payment_method}`, p.payment_method)}</Text>
                                    {p.reference && <Text size="xs" c="dimmed">Ref: {p.reference}</Text>}
                                  </Table.Td>
                                  <Table.Td ta="right">
                                    <Text size="sm" fw={600} c="teal.7">{f.currency} {Number(p.amount).toFixed(2)}</Text>
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                              {f.payments.length === 0 && (
                                <Table.Tr>
                                  <Table.Td colSpan={3} ta="center" py="xl">
                                    <Text c="dimmed" size="sm">{t('common.empty', 'No records found')}</Text>
                                  </Table.Td>
                                </Table.Tr>
                              )}
                            </Table.Tbody>
                          </Table>
                        </Card>
                      </Grid.Col>
                    </Grid>
                  </Box>
                ))}
              </Tabs.Panel>
            </Tabs>
          )}
        </Box>
      </Stack>

      <Modal 
        opened={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        title={t('portal.students.finances.modal.title', 'Registrar Pago Manual')}
        radius="xs"
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={paymentForm.onSubmit((v) => handleRegisterPayment(v, selectedTenantId))}>
          <Stack>
            <NumberInput 
              label={t('portal.students.finances.modal.amount', 'Amounting to Apply')} 
              prefix={`${profile?.financials.find(f => f.tenant_id === selectedTenantId)?.currency} `}
              decimalScale={2}
              min={0.01}
              {...paymentForm.getInputProps('amount')}
            />
            <Select 
              label={t('portal.students.finances.modal.method', 'Payment Method')}
              data={[
                { value: 'CASH', label: t('portal.students.finances.methods.CASH', 'Cash') },
                { value: 'TRANSFER', label: t('portal.students.finances.methods.TRANSFER', 'Bank Transfer') },
                { value: 'CHECK', label: t('portal.students.finances.methods.CHECK', 'Check') },
                { value: 'CARD', label: t('portal.students.finances.methods.CARD', 'Credit/Debit Card') },
                { value: 'OTHER', label: t('portal.students.finances.methods.OTHER', 'Other') }
              ]}
              {...paymentForm.getInputProps('payment_method')}
            />
            <TextInput 
              label={t('portal.students.finances.modal.reference', 'Reference Number')} 
              placeholder={t('portal.students.finances.modal.referencePlaceholder', 'Transaction ID, Check Number...')}
              {...paymentForm.getInputProps('reference')}
            />
            <TextInput 
              label={t('portal.students.finances.modal.notes', 'Notes')} 
              placeholder={t('portal.students.finances.modal.notesPlaceholder', 'Optional extra notes')}
              {...paymentForm.getInputProps('notes')}
            />
            <Button type="submit" fullWidth mt="md" radius="xs">
              {t('portal.students.finances.modal.submit', 'Confirm Payment')}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
