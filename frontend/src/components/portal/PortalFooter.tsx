import { Box, Container, Text, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../../hooks/useInstitution';

export function PortalFooter() {
  const { t } = useTranslation();
  const { name } = useInstitution();
  const year = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      py="xl" 
      style={{ 
        backgroundColor: '#fff', 
        borderTop: '1px solid #f1f3f5',
        marginTop: 'auto'
      }}
    >
      <Container size="lg">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            © {year} {name} {t('portal.footer.rights')}
          </Text>
          <Group gap="xl">
            <Text component="a" href="#" size="sm" c="dimmed" style={{ textDecoration: 'none' }}>{t('portal.footer.support')}</Text>
            <Text component="a" href="#" size="sm" c="dimmed" style={{ textDecoration: 'none' }}>{t('portal.footer.privacy')}</Text>
            <Text component="a" href="#" size="sm" c="dimmed" style={{ textDecoration: 'none' }}>{t('portal.footer.terms')}</Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
