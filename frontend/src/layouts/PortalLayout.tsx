import { Outlet } from 'react-router-dom';
import { PortalHeader } from '../components/PortalHeader';
import { PortalFooter } from '../components/portal/PortalFooter';
import { useAuth } from '../hooks/useAuth';
import { Center, Loader } from '@mantine/core';

export function PortalLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center style={{ width: '100vw', height: '100vh' }}>
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      {isAuthenticated && <PortalHeader />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <PortalFooter />
    </div>
  );
}
