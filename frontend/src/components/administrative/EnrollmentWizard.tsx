import { useState, useEffect } from 'react';
import { 
  Button, Group, TextInput, Select, Stack, 
  Text, Paper, Title, ActionIcon, List, ThemeIcon,
  Alert, LoadingOverlay, Box, Grid, Divider, Badge,
  Textarea
} from '@mantine/core';
import { Stepper } from '@ux/index';
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { 
  IconUpload, IconCheck, 
  IconX, IconFileDescription, IconInfoCircle, 
  IconChevronRight, IconChevronLeft, IconAlertCircle
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config';
import { useInstitution } from '../../hooks/useInstitution';
import { resizeImage } from '../../utils/image-resizer';

import type { 
  Program, Campus, Calendar 
} from './enrollment-wizard/types';
import { StepPersonalDetails } from './enrollment-wizard/StepPersonalDetails';
import { StepProgramSelection } from './enrollment-wizard/StepProgramSelection';
import { StepDocumentUpload } from './enrollment-wizard/StepDocumentUpload';
import { StepReview } from './enrollment-wizard/StepReview';

interface EnrollmentWizardProps {
  onSuccess?: () => void;
}

export function EnrollmentWizard({ onSuccess }: EnrollmentWizardProps) {
  const { t } = useTranslation();
  const { slug } = useInstitution();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Track the current document index for the upload card
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  
  // Track the admission record ID created in the Details step
  const [admissionId, setAdmissionId] = useState<string | null>(null);
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Track uploaded files and their upload status
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});

  const form = useForm({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      campusId: '',
      programId: '',
      calendarId: '',
      notes: '',
    },
    validate: {
      fullName: (val) => (active >= 0 && (!val || val.length < 3) ? t('registration.validation.nameTooShort') : null),
      email: (val) => (active >= 0 && (!val || !/^\S+@\S+$/.test(val)) ? t('registration.validation.invalidEmail') : null),
      phone: (val) => (active >= 0 && (!val || val.length < 5) ? t('registration.validation.invalidPhone') : null),
      campusId: (val) => (active >= 1 && !val ? t('registration.validation.campusRequired') : null),
      programId: (val) => (active >= 1 && !val ? t('registration.validation.programRequired') : null),
      calendarId: (val) => (active >= 1 && !val ? t('registration.validation.calendarRequired') : null),
    },
  });

  useEffect(() => {
    // Fetch Campuses on mount
    setLoadingCampuses(true);
    fetch(`${API_BASE_URL}/v1/organization/campuses/public/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCampuses(data);
      })
      .catch(console.error)
      .finally(() => setLoadingCampuses(false));
  }, [slug]);

  // Fetch Programs when Campus changes (Cascading)
  useEffect(() => {
    if (form.values.campusId) {
      setLoadingPrograms(true);
      fetch(`${API_BASE_URL}/v1/academic/programs/public/${slug}?campus_id=${form.values.campusId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setPrograms(data);
          if (form.values.programId && !data.find((p: Program) => p.id === form.values.programId)) {
            form.setFieldValue('programId', '');
            form.setFieldValue('calendarId', '');
          }
        })
        .catch(console.error)
        .finally(() => setLoadingPrograms(false));
    }
  }, [form.values.campusId, slug]);

  // Fetch Calendars when Campus or Program changes (Cascading)
  useEffect(() => {
    if (form.values.campusId && form.values.programId) {
      setLoadingCalendars(true);
      fetch(`${API_BASE_URL}/v1/calendar/academic-periods/public/${slug}?campus_id=${form.values.campusId}&program_id=${form.values.programId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCalendars(data);
          if (form.values.calendarId && !data.find((c: Calendar) => c.id === form.values.calendarId)) {
            form.setFieldValue('calendarId', '');
          }
        })
        .catch(console.error)
        .finally(() => setLoadingCalendars(false));
    }
  }, [form.values.campusId, form.values.programId, slug]);

  const selectedProgram = programs.find(p => p.id === form.values.programId);
  const allDocs = selectedProgram?.required_documents || [];

  const uploadSingleFile = async (requirement: string, file: File) => {
    if (!admissionId) return;
    
    setUploadStatus(prev => ({ ...prev, [requirement]: 'uploading' }));
    const formData = new FormData();
    formData.append('files', file);

    try {
      const res = await fetch(`${API_BASE_URL}/v1/administrative/admissions/public/${slug}/${admissionId}/attachments`, {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) throw new Error('File upload failed');
      
      setUploadedFiles(prev => ({ ...prev, [requirement]: file }));
      setUploadStatus(prev => ({ ...prev, [requirement]: 'success' }));
    } catch (error) {
      console.error(error);
      setUploadStatus(prev => ({ ...prev, [requirement]: 'error' }));
      setValidationError(t('registration.error'));
    }
  };

  const handleFileDrop = async (requirement: string, files: File[]) => {
    const file = files[0];
    if (!file) return;

    setValidationError(null);
    try {
      let finalFile = file;
      if (file.type.startsWith('image/')) {
        finalFile = await resizeImage(file, { maxWidth: 1200, quality: 0.8 });
      }
      
      // Automatically advance to next missing file if possible
      if (admissionId) {
        await uploadSingleFile(requirement, finalFile);
        
        // Find next missing document index
        const nextMissingIndex = allDocs.findIndex((doc, index) => 
          index > currentDocIndex && doc.is_required && !uploadedFiles[doc.name]
        );
        if (nextMissingIndex !== -1) {
          setCurrentDocIndex(nextMissingIndex);
        } else {
          // Check if any required file is still missing
          const anyMissingIndex = allDocs.findIndex((doc) => doc.is_required && !uploadedFiles[doc.name]);
          if (anyMissingIndex !== -1 && anyMissingIndex !== currentDocIndex) {
            setCurrentDocIndex(anyMissingIndex);
          }
        }
      } else {
        setUploadedFiles(prev => ({ ...prev, [requirement]: finalFile }));
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const nextStep = async () => {
    setValidationError(null);
    setSubmissionError(null);
    
    // Step 0: Details -> Create Record
    if (active === 0) {
      const validation = form.validate();
      if (validation.hasErrors) {
        // Focus and scroll to first error
        const firstErrorPath = Object.keys(validation.errors)[0];
        const element = document.querySelector(`[name="${firstErrorPath}"], #${firstErrorPath}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (element instanceof HTMLElement) element.focus();
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/v1/administrative/admissions/public/${slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: form.values.fullName,
            email: form.values.email,
            phone: form.values.phone,
          }),
        });
        if (!res.ok) throw new Error('Failed to create record');
        const data = await res.json();
        setAdmissionId(data.id);
        setActive(1);
      } catch (error) {
        setSubmissionError(t('registration.errorMessage'));
        console.error(error);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Step 1: Selection -> Update Record
    if (active === 1) {
      const validation = form.validate();
      if (validation.hasErrors) {
        const firstErrorPath = Object.keys(validation.errors)[0];
        const element = document.querySelector(`[name="${firstErrorPath}"], #${firstErrorPath}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (element instanceof HTMLElement) element.focus();
        return;
      }
      
      if (!admissionId) return;

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/v1/administrative/admissions/public/${slug}/${admissionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campus_id: form.values.campusId,
            program_id: form.values.programId,
            calendar_id: form.values.calendarId,
            notes: form.values.notes,
          }),
        });
        if (!res.ok) throw new Error('Failed to update selection');
        setActive(2);
      } catch (error) {
        setSubmissionError(t('registration.errorMessage'));
        console.error(error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 2: Docs Check
    if (active === 2) {
      const missingRequired = allDocs
        .filter(doc => doc.is_required)
        .filter(doc => !uploadedFiles[doc.name]);
        
      if (missingRequired.length > 0) {
        setValidationError(t('registration.docs.missingMessage', { 
          docs: missingRequired.map(d => d.name).join(', ') 
        }));
        return;
      }
      setActive(3);
      return;
    }

    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () => {
    setValidationError(null);
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  const handleSubmit = async () => {
    if (!admissionId) return;
    
    setLoading(true);
    setSubmissionError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/v1/administrative/admissions/public/${slug}/${admissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'VERIFYING',
        }),
      });

      if (!res.ok) throw new Error('Failed to finalize admission');
      
      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      setSubmissionError(t('registration.errorMessage'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Paper withBorder p="xl" radius="xs" bg="var(--mantine-color-green-0)" maw={604} mx="auto">
        <Stack align="center" gap="md">
          <ThemeIcon size={60} radius="xs" color="green">
            <IconCheck size={40} />
          </ThemeIcon>
          <Title order={2} ta="center">{t('registration.successTitle')}</Title>
          <Text ta="center" size="lg">{t('registration.successMessage')}</Text>
          <Button variant="outline" color="green" mt="md" onClick={() => window.location.reload()} fullWidth size="lg">
            {t('common.back')}
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box pos="relative" w={604} maw={'100%'} mx="auto">
      
      <Box mb={20} w="100%">
        <Stepper 
          active={active} 
          onStepClick={setActive} 
          color="brand"
          size="sm"
          allowNextStepsSelect={false}
        >
          <Stepper.Step label={t('registration.steps.details')} />
          <Stepper.Step label={t('registration.steps.selection')} />
          <Stepper.Step label={t('registration.steps.docs')} />
          <Stepper.Step label={t('registration.steps.review')} />
        </Stepper>

      

      <Stack gap="xl" px="md">
        {active === 0 && (
          <StepPersonalDetails form={form} loading={loading} />
        )}

        {active === 1 && (
          <StepProgramSelection 
            form={form} 
            loading={loading}
            campuses={campuses}
            programs={programs}
            calendars={calendars}
            loadingCampuses={loadingCampuses}
            loadingPrograms={loadingPrograms}
            loadingCalendars={loadingCalendars}
          />
        )}

        {active === 2 && (
          <StepDocumentUpload 
            allDocs={allDocs}
            currentDocIndex={currentDocIndex}
            uploadedFiles={uploadedFiles}
            uploadStatus={uploadStatus}
            onFileDrop={handleFileDrop}
            onRemoveFile={(requirement) => {
              setUploadedFiles(prev => {
                const next = { ...prev };
                delete next[requirement];
                return next;
              });
              setUploadStatus(prev => {
                const next = { ...prev };
                delete next[requirement];
                return next;
              });
            }}
            onSetDocIndex={setCurrentDocIndex}
          />
        )}

        {active === 3 && (
          <StepReview 
            form={form}
            campuses={campuses}
            programs={programs}
            uploadedFiles={uploadedFiles}
          />
        )}
      </Stack>

      {(validationError || submissionError) && (
        <Alert icon={<IconAlertCircle size={16} />} title={t('common.error.title')} color="red" mt="xl" radius="xs">
          {submissionError || validationError}
        </Alert>
      )}

      <Group justify="stretch" mt={40} gap="md">
        {active !== 0 && (
          <Button 
            variant="default" 
            onClick={prevStep} 
            leftSection={<IconChevronLeft size={18} />}
            size="lg"
            radius="xs"
            style={{ flex: 1 }}
          >
            {t('common.previous')}
          </Button>
        )}
        
        {active < 3 ? (
          <Button 
            onClick={nextStep} 
            rightSection={<IconChevronRight size={18} />} 
            color="brand" 
            loading={loading}
            size="lg"
            radius="xs"
            style={{ flex: 2 }}
          >
            {t('common.next')}
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            loading={loading} 
            color="brand" 
            leftSection={<IconCheck size={18} />}
            size="lg"
            radius="xs"
            style={{ flex: 2 }}
          >
            {t('registration.submit')}
          </Button>
        )}
      </Group>
      </Box>
    </Box>
  );
}
