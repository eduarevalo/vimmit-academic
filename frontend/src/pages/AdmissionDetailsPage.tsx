import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, Stack, Text, Button, Badge, Paper, 
  Group, Grid, Title, Divider, ActionIcon, 
  Tooltip, Alert, Loader, ThemeIcon,
  SimpleGrid, Modal, Image, Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconUser, IconSchool, IconCalendar, IconMapPin,
  IconMail, IconPhone, IconFileDescription, IconDownload,
  IconChevronLeft, IconCheck, IconX,
  IconClock, IconFileCheck, IconInfoCircle, IconEye,
  IconZoomIn, IconZoomOut, IconAlertCircle, IconUserCheck, IconEdit
} from '@tabler/icons-react';

import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/common/PageHeader';
import { PhotoEditorModal } from '../components/administrative/PhotoEditorModal';
import { API_BASE_URL } from '../config';

interface Attachment {
  id: string;
  file_name: string;
  content_type: string;
  size: number;
  download_url: string;
}

interface AdmissionApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  program_name?: string;
  campus_name?: string;
  calendar_name?: string;
  status: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'REJECTED' | 'ENROLLED';
  notes?: string;
  created_at: string;
  attachments: Attachment[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'gray',
  VERIFYING: 'blue',
  VERIFIED: 'green',
  REJECTED: 'red',
  ENROLLED: 'teal',
};

export function AdmissionDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [app, setApp] = useState<AdmissionApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollAlert, setEnrollAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [viewerOpened, { open: openViewer, close: closeViewer }] = useDisclosure(false);
  const [zoom, setZoom] = useState(1);

  const [editorOpened, { open: openEditor, close: closeEditor }] = useDisclosure(false);
  const [savingFile, setSavingFile] = useState(false);

  const handleViewFile = (file: Attachment) => {
    setSelectedFile(file);
    setZoom(1);
    openViewer();
  };

  const handleEditFile = (file: Attachment) => {
    setSelectedFile(file);
    openEditor();
  };

  const handleSaveEditedPhoto = async (blob: Blob) => {
    if (!selectedFile || !token) return;
    setSavingFile(true);
    
    try {
      const formData = new FormData();
      formData.append('file', blob, selectedFile.file_name);
      
      const res = await fetch(`${API_BASE_URL}/v1/administrative/attachments/${selectedFile.id}/replace`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        closeEditor();
        await fetchApplication(); // Refresh UI
      } else {
        alert('Error al guardar la imagen editada');
      }
    } catch (err) {
      console.error('Error saving edited photo:', err);
      alert('Error de conexión al guardar');
    } finally {
      setSavingFile(false);
    }
  };

  const fetchApplication = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/administrative/admissions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApp(data);
      } else {
        setError(t('portal.admissions.error.notFound') || 'Solicitud no encontrada');
      }
    } catch (err) {
      console.error('Error fetching admission:', err);
      setError(t('common.error.unknown'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id, token]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || !token) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/administrative/admissions/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchApplication();
      } else {
        alert('Error al actualizar el estado');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleEnroll = async () => {
    if (!id || !token) return;
    setEnrolling(true);
    setEnrollAlert(null);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/administrative/admissions/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Enrollment failed');
      }
      
      setEnrollAlert({
        type: 'success',
        message: t('portal.admissions.list.enrollSuccess')
      });
      
      fetchApplication();
    } catch (error: any) {
      setEnrollAlert({
        type: 'error',
        message: error.message || 'Error processing enrollment'
      });
    } finally {
      setEnrolling(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container size="lg" py={40} ta="center">
        <Loader size="xl" />
      </Container>
    );
  }

  if (error || !app) {
    return (
      <Container size="lg" py={40}>
        <Alert color="red" icon={<IconX size={16} />} title="Error">
          {error || 'No se pudo cargar la información'}
        </Alert>
        <Button variant="subtle" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate('/portal/administrative/admissions')} mt="md">
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        <PageHeader 
          title={app.full_name}
          subtitle={`Solicitud de Admisión #${app.id.slice(0, 8)}`}
          withBackButton
          actions={
            <Group>
              <Badge size="xl" color={STATUS_COLORS[app.status]} radius="xs" variant="filled">
                {t(`portal.admissions.status.${app.status}`) || app.status}
              </Badge>
            </Group>
          }
        />

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Contenido Principal: Información del Postulante */}
              <Paper withBorder p="xl" radius="xs">
                <Title order={4} mb="lg" fw={600} tt="uppercase" c="dimmed" size="xs">
                  Información del Postulante
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Group wrap="nowrap">
                    <ThemeIcon size={40} radius="xs" variant="light" color="blue">
                      <IconUser size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">Nombre Completo</Text>
                      <Text fw={500}>{app.full_name}</Text>
                    </div>
                  </Group>
                  <Group wrap="nowrap">
                    <ThemeIcon size={40} radius="xs" variant="light" color="teal">
                      <IconMail size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">Correo Electrónico</Text>
                      <Text fw={500}>{app.email}</Text>
                    </div>
                  </Group>
                  <Group wrap="nowrap">
                    <ThemeIcon size={40} radius="xs" variant="light" color="orange">
                      <IconPhone size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">Teléfono</Text>
                      <Text fw={500}>{app.phone}</Text>
                    </div>
                  </Group>
                  <Group wrap="nowrap">
                    <ThemeIcon size={40} radius="xs" variant="light" color="indigo">
                      <IconClock size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">Fecha de Solicitud</Text>
                      <Text fw={500}>{new Date(app.created_at).toLocaleString()}</Text>
                    </div>
                  </Group>
                </SimpleGrid>
              </Paper>

              {/* Información Académica */}
              <Paper withBorder p="xl" radius="xs">
                <Title order={4} mb="lg" fw={600} tt="uppercase" c="dimmed" size="xs">
                  Detalles del Programa
                </Title>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Stack gap={5}>
                      <Group gap={5}>
                        <IconSchool size={16} color="var(--mantine-color-blue-filled)" />
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Programa</Text>
                      </Group>
                      <Text fw={500}>{app.program_name || 'No especificado'}</Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Stack gap={5}>
                      <Group gap={5}>
                        <IconMapPin size={16} color="var(--mantine-color-red-filled)" />
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Sede</Text>
                      </Group>
                      <Text fw={500}>{app.campus_name || 'No especificada'}</Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Stack gap={5}>
                      <Group gap={5}>
                        <IconCalendar size={16} color="var(--mantine-color-teal-filled)" />
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Periodo</Text>
                      </Group>
                      <Text fw={500}>{app.calendar_name || 'No especificado'}</Text>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Documentos Adjuntos */}
              <Paper withBorder p="xl" radius="xs">
                <Group justify="space-between" mb="lg">
                  <Title order={4} fw={600} tt="uppercase" c="dimmed" size="xs">
                    Documentación Adjunta
                  </Title>
                  <Badge variant="outline" color="gray">{app.attachments?.length || 0} Archivos</Badge>
                </Group>
                
                {app.attachments && app.attachments.length > 0 ? (
                  <Stack gap="sm">
                    {app.attachments.map((file) => (
                      <Paper key={file.id} withBorder p="md" radius="xs" bg="gray.0">
                        <Group justify="space-between">
                          <Group>
                            {file.content_type.includes('image') ? (
                              <Image src={file.download_url} w={40} h={40} radius="xs" fit="cover" />
                            ) : (
                              <ThemeIcon size="lg" variant="white" color="blue">
                                {file.content_type.includes('pdf') ? <IconFileDescription size={20} /> : <IconFileCheck size={20} />}
                              </ThemeIcon>
                            )}
                            <div>
                              <Text size="sm" fw={500}>{file.file_name}</Text>
                              <Group gap={10}>
                                <Text size="xs" c="dimmed">{file.content_type}</Text>
                                <Text size="xs" c="dimmed">•</Text>
                                <Text size="xs" c="dimmed">{formatFileSize(file.size)}</Text>
                              </Group>
                            </div>
                          </Group>
                          <Group>
                            {file.content_type.includes('image') && (
                              <Tooltip label="Editar foto">
                                <ActionIcon onClick={() => handleEditFile(file)} variant="light" color="orange">
                                  <IconEdit size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Ver documento">
                              <ActionIcon onClick={() => handleViewFile(file)} variant="light" color="blue">
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Descargar archivo">
                              <ActionIcon component="a" href={file.download_url} download={file.file_name} variant="light" color="teal">
                                <IconDownload size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                    No se han cargado documentos para esta solicitud.
                  </Alert>
                )}
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Panel de Acciones */}
              <Paper withBorder p="xl" radius="xs">
                <Title order={4} mb="lg" fw={600} tt="uppercase" c="dimmed" size="xs">
                  Acciones de Gestión
                </Title>
                <Stack gap="md">
                  <Button 
                    fullWidth 
                    variant="light" 
                    color="blue" 
                    leftSection={<IconClock size={16} />}
                    onClick={() => handleUpdateStatus('VERIFYING')}
                    loading={updating}
                    disabled={app.status === 'VERIFYING'}
                  >
                    Mover a Verificando
                  </Button>
                  <Button 
                    fullWidth 
                    variant="light" 
                    color="green" 
                    leftSection={<IconCheck size={16} />}
                    onClick={() => handleUpdateStatus('VERIFIED')}
                    loading={updating}
                    disabled={app.status === 'VERIFIED'}
                  >
                    Aprobar Verificación
                  </Button>
                  <Button 
                    fullWidth 
                    variant="light" 
                    color="red" 
                    leftSection={<IconX size={16} />}
                    onClick={() => handleUpdateStatus('REJECTED')}
                    loading={updating}
                    disabled={app.status === 'REJECTED'}
                  >
                    Rechazar Solicitud
                  </Button>
                  
                  <Divider my="sm" />
                  
                  {app.status === 'VERIFIED' && (
                    <Button 
                      fullWidth 
                      color="teal" 
                      size="md"
                      leftSection={<IconUserCheck size={20} />}
                      onClick={handleEnroll}
                      loading={enrolling}
                    >
                      {t('portal.admissions.list.enroll')}
                    </Button>
                  )}

                  {enrollAlert && (
                    <Alert 
                      variant="light" 
                      color={enrollAlert.type === 'success' ? 'green' : 'red'} 
                      icon={<IconAlertCircle size={16} />}
                      withCloseButton
                      onClose={() => setEnrollAlert(null)}
                      mt="sm"
                    >
                      {enrollAlert.message}
                    </Alert>
                  )}
                </Stack>
              </Paper>

              <Paper withBorder p="xl" radius="xs">
                <Title order={4} mb="md" fw={600} tt="uppercase" c="dimmed" size="xs">
                  Notas Internas
                </Title>
                <Text size="sm" c="dimmed" fs="italic">
                  {app.notes || 'No hay notas adicionales para esta solicitud.'}
                </Text>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>

        <Modal 
          opened={viewerOpened} 
          onClose={closeViewer} 
          title={<Text fw={600} size="sm" tt="uppercase" c="brand.4">{selectedFile?.file_name || 'Documento'}</Text>} 
          radius="xs"
          transitionProps={{ transition: 'fade', duration: 200 }}
        >
          {selectedFile && (
            <Stack>
              {selectedFile.content_type.includes('image') && (
                <Group justify="center" gap="sm">
                  <ActionIcon variant="light" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}>
                    <IconZoomOut size={16} />
                  </ActionIcon>
                  <Text size="sm" fw={500} w={40} ta="center">{Math.round(zoom * 100)}%</Text>
                  <ActionIcon variant="light" onClick={() => setZoom(z => Math.min(4, z + 0.25))}>
                    <IconZoomIn size={16} />
                  </ActionIcon>
                </Group>
              )}
              
              <Box style={{ overflow: 'auto', maxHeight: '75vh', display: 'flex', justifyContent: 'center' }}>
                {selectedFile.content_type.includes('pdf') ? (
                  <iframe 
                    src={selectedFile.download_url} 
                    style={{ width: '100%', height: '75vh', minHeight: '500px', border: 'none' }}
                    title={selectedFile.file_name} 
                  />
                ) : selectedFile.content_type.includes('image') ? (
                  <img 
                    src={selectedFile.download_url} 
                    alt={selectedFile.file_name}
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                    No hay vista previa disponible para este tipo de archivo. Descárgalo para visualizarlo.
                  </Alert>
                )}
              </Box>
            </Stack>
          )}
        </Modal>

        {selectedFile && (
          <PhotoEditorModal 
            opened={editorOpened}
            onClose={closeEditor}
            imageUrl={selectedFile.download_url}
            onSave={handleSaveEditedPhoto}
            processing={savingFile}
          />
        )}
      </Stack>
    </Container>
  );
}
