import { Title, Text, Stack, Group, Button, Box } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  withBackButton?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, withBackButton, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Stack gap="xs" mb="xl">
      <Group justify="space-between" align="flex-end">
        <Stack gap={5} style={{ flex: 1 }} align="flex-start">
          {withBackButton && (
            <Button 
              variant="subtle" 
              leftSection={<IconArrowLeft size={16} />} 
              onClick={() => navigate(-1)}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }
              }}
            >
              {t('common.goBack')}
            </Button>
          )}
          <Title order={1} fw={900} size={38} style={{ lineHeight: 1.1 }}>
            {title}
          </Title>
          {subtitle && (
            <Text c="dimmed" size="lg" fw={500}>
              {subtitle}
            </Text>
          )}
        </Stack>
        
        {actions && (
          <Box mb={5}>
            {actions}
          </Box>
        )}
      </Group>
    </Stack>
  );
}
