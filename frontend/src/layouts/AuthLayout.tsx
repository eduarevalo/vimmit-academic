import { Outlet } from 'react-router-dom';
import { PortalFooter } from '../components/portal/PortalFooter';

export function AuthLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Outlet />
      </main>
      <PortalFooter />
    </div>
  );
}
