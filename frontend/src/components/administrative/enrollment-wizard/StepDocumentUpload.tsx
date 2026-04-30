import { 
  Stack, Box, Title, Text, LoadingOverlay, ThemeIcon, 
  Button, Paper, Group, ActionIcon, Divider 
} from '@mantine/core';
import { useState } from 'react';
import { PhotoEditorModal } from '../PhotoEditorModal';
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { 
  IconUpload, IconCheck, IconFileDescription, IconX 
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { RequiredDocument } from './types';

interface StepDocumentUploadProps {
  allDocs: RequiredDocument[];
  currentDocIndex: number;
  uploadedFiles: Record<string, File>;
  uploadStatus: Record<string, 'idle' | 'uploading' | 'success' | 'error' | string>;
  onFileDrop: (requirement: string, files: File[]) => void;
  onRemoveFile: (requirement: string, index: number) => void;
  onSetDocIndex: (index: number) => void;
}

export function StepDocumentUpload({
  allDocs,
  currentDocIndex,
  uploadedFiles,
  uploadStatus,
  onFileDrop,
  onRemoveFile,
  onSetDocIndex,
}: StepDocumentUploadProps) {
  const { t } = useTranslation();
  const currentDoc = allDocs[currentDocIndex];

  // Editor states
  const [editorOpened, setEditorOpened] = useState(false);
  const [editingFileUrl, setEditingFileUrl] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>('');
  const [editingRequirement, setEditingRequirement] = useState<string>('');

  const handleDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setEditingFileUrl(url);
      setEditingFileName(file.name);
      setEditingRequirement(currentDoc.name);
      setEditorOpened(true);
    } else {
      // PDF or other - direct upload
      onFileDrop(currentDoc.name, files);
    }
  };

  const handleEditorSave = (blob: Blob) => {
    const editedFile = new File([blob], editingFileName, { type: 'image/jpeg' });
    onFileDrop(editingRequirement, [editedFile]);
    setEditorOpened(false);
    if (editingFileUrl) URL.revokeObjectURL(editingFileUrl);
  };

  return (
    <Stack gap="xl" w="100%">
      <Box mt="xl" mb="xl">
        <Title order={2} ta="center">{t('registration.steps.docs')}</Title>
        <Text c="green" fw={600} size="sm" ta="center" mt="xs">
          {uploadedFiles[currentDoc?.name] 
            ? `✓ ${t('registration.docs.status.uploaded')}` 
            : t('registration.docs.status.pleaseUpload', { doc: currentDoc?.name || 'documento' })}
        </Text>
        <Text c="dimmed" size="sm" ta="center">{t('registration.program.requirementsInfo')}</Text>
      </Box>

      {!uploadedFiles[currentDoc?.name] && (
        <Box py={40} radius="xs" bg="var(--mantine-color-gray-0)" style={{ border: '2px dashed var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-lg)', position: 'relative' }}>
          <LoadingOverlay visible={uploadStatus[currentDoc?.name] === 'uploading'} overlayProps={{ radius: 'lg' }} loaderProps={{ type: 'dots' }} />
          <Dropzone
            onDrop={handleDrop}
            maxSize={5 * 1024 ** 2}
            accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
            multiple={false}
            radius="xs"
            style={{ width: '100%', backgroundColor: 'transparent', border: 'none' }}
          >
            <Stack align="center" gap="md">
              <ThemeIcon size={64} radius="xs" variant="light" color="brand" bg="transparent">
                <IconUpload size={32} />
              </ThemeIcon>
              <Box ta="center">
                <Text size="lg" fw={700}>
                  {t('registration.docs.dropzone.titleText')}
                </Text>
                <Text size="sm" c="dimmed">{t('registration.docs.dropzone.subtitle')}</Text>
              </Box>
              <Button variant="default" radius="xs" size="md" px="xl">{t('registration.docs.dropzone.button')}</Button>
            </Stack>
          </Dropzone>
        </Box>
      )}

      <Stack gap="sm" mt="md">
        <Text fw={700} size="sm" tt="uppercase" lts={1} c="dimmed">{t('registration.docs.listTitle')}</Text>
        {allDocs.map((doc, index) => (
          <Paper key={doc.name} withBorder p="md" radius="xs">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="md">
                <ThemeIcon 
                  variant="light" 
                  color={uploadedFiles[doc.name] ? 'green' : (index === currentDocIndex ? 'brand' : 'gray')} 
                  size={40} 
                  radius="xs"
                >
                  {uploadedFiles[doc.name] ? <IconCheck size={24} /> : (doc.name.toLowerCase().includes('pdf') ? <IconFileDescription size={24} /> : <IconUpload size={24} />)}
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={600} size="sm">{doc.name}</Text>
                  <Text size="xs" c="dimmed">
                    {uploadedFiles[doc.name] 
                      ? `${(uploadedFiles[doc.name].size / 1024).toFixed(1)} KB • ${t('registration.docs.status.completed')}` 
                      : (doc.is_required ? t('registration.docs.required') : t('registration.docs.optional'))}
                  </Text>
                </Stack>
              </Group>
              
              <Group gap="xs">
                {uploadedFiles[doc.name] && (
                  <ActionIcon 
                    variant="subtle" 
                    color="gray" 
                    onClick={() => onRemoveFile(doc.name, index)}
                  >
                    <IconX size={20} />
                  </ActionIcon>
                )}
                
                {!uploadedFiles[doc.name] && index !== currentDocIndex && (
                  <Button variant="subtle" size="xs" color="brand" onClick={() => onSetDocIndex(index)}>
                    {t('registration.docs.uploadNow')}
                  </Button>
                )}

                {!doc.is_required && !uploadedFiles[doc.name] && index === currentDocIndex && (
                  <Button variant="subtle" size="xs" color="gray" onClick={() => {
                    const nextIdx = allDocs.findIndex((d, idx) => idx > index && !uploadedFiles[d.name]);
                    if (nextIdx !== -1) onSetDocIndex(nextIdx);
                  }}>
                    {t('registration.docs.skip')}
                  </Button>
                )}
              </Group>
            </Group>
            
            {uploadStatus[doc.name] === 'uploading' && index === currentDocIndex && (
              <Box mt="xs">
                <Divider color="brand" size="sm" label={t('registration.docs.status.uploading')} labelPosition="center" />
              </Box>
            )}
          </Paper>
        ))}
      </Stack>

      <PhotoEditorModal
        opened={editorOpened}
        onClose={() => {
          setEditorOpened(false);
          if (editingFileUrl) URL.revokeObjectURL(editingFileUrl);
        }}
        imageUrl={editingFileUrl || ''}
        onSave={handleEditorSave}
        aspect={editingRequirement.toLowerCase().includes('carnet') || editingRequirement.toLowerCase().includes('foto') ? 3/4 : undefined}
      />
    </Stack>
  );
}
