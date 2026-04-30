import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PortalHeader } from '../components/PortalHeader';
import { PortalFooter } from '../components/portal/PortalFooter';
import { PortalNav } from '../components/portal/PortalNav';
import { useAuth } from '../hooks/useAuth';
import { Center, Loader } from '@mantine/core';

export function PortalLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [navOpened, setNavOpened] = useState(false);

  if (isLoading) {
    return (
      <Center style={{ width: '100vw', height: '100vh' }}>
        <Loader color="brand" size="xl" />
      </Center>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {isAuthenticated && (
        <PortalHeader
          navOpened={navOpened}
          onNavToggle={() => setNavOpened((o) => !o)}
        />
      )}
      <div style={{ flex: 1, display: 'flex' }}>
        {isAuthenticated && (
          <PortalNav
            mobileOpened={navOpened}
            onMobileClose={() => setNavOpened(false)}
          />
        )}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
      <PortalFooter />
    </div>
  );
}
