import { NavLink, Stack, Text, Box, Drawer } from '@mantine/core';
import { IconBuilding, IconCalendar, IconBook2, IconClipboardList, IconClock, IconListCheck } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PortalNavProps {
  mobileOpened: boolean;
  onMobileClose: () => void;
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box mb="md">
      <Text size="xs" fw={700} c="dimmed" px={12} mb={8} tt="uppercase" style={{ letterSpacing: '0.08em' }}>
        {title}
      </Text>
      <Stack gap={4}>
        {children}
      </Stack>
    </Box>
  );
}

function NavContent({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const renderLink = (to: string, labelKey: string, icon: any) => (
    <NavLink
      key={to}
      component={Link}
      to={to}
      label={t(labelKey)}
      leftSection={icon}
      active={pathname.includes(to)}
      onClick={onClose}
      styles={{ root: { borderRadius: 8, fontWeight: 500 } }}
      color="brand"
    />
  );

  return (
    <Stack gap={0}>
      <NavSection title={t('portal.nav.academic')}>
        {renderLink('/portal/academic/programs', 'portal.nav.programs', <IconBook2 size={16} />)}
        {renderLink('/portal/academic/courses',  'portal.nav.courses',  <IconListCheck size={16} />)}
      </NavSection>

      <NavSection title={t('portal.nav.administrative')}>
        {renderLink('/portal/administrative/enrollments', 'portal.nav.enrollments', <IconClipboardList size={16} />)}
        {renderLink('/portal/administrative/deadlines',   'portal.nav.deadlines',   <IconClock size={16} />)}
      </NavSection>

      <NavSection title={t('portal.nav.organization')}>
        {renderLink('/portal/organization/campus', 'portal.nav.campus', <IconBuilding size={16} />)}
      </NavSection>

      <NavSection title={t('portal.nav.calendar')}>
        {renderLink('/portal/calendar/academic-periods', 'portal.nav.calendars', <IconCalendar size={16} />)}
      </NavSection>
    </Stack>
  );
}

export function PortalNav({ mobileOpened, onMobileClose }: PortalNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <Box
        component="nav"
        visibleFrom="sm"
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid #f1f3f5',
          backgroundColor: '#fff',
          padding: '24px 12px',
        }}
      >
        <NavContent />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        opened={mobileOpened}
        onClose={onMobileClose}
        size={220}
        padding="md"
        hiddenFrom="sm"
        withCloseButton={false}
        styles={{ body: { padding: '24px 12px' } }}
      >
        <NavContent onClose={onMobileClose} />
      </Drawer>
    </>
  );
}
