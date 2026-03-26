import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface CanProps {
  /** The roles that are allowed to see this content. E.g. ["Admin"] */
  roles: string[];
  /** Optional tenant identifier. If omitted, checks if user has the role in ANY tenant. */
  tenantId?: string;
  /** Content to show if user has the role. */
  children: React.ReactNode;
  /** Optional content to show if user DOES NOT have the role. */
  fallback?: React.ReactNode;
}

/**
 * Component for role-based access control in the UI.
 */
export function Can({ roles, tenantId, children, fallback = null }: CanProps) {
  const { hasRole } = useAuth();
  
  if (hasRole(roles, tenantId)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
