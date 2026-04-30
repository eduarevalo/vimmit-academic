import React from 'react';
import { Box } from '@mantine/core';
import { PublicHeader, PublicHeaderProps } from './PublicHeader';
import { PublicFooter, PublicFooterProps } from './PublicFooter';

export interface PublicShellProps {
  children: React.ReactNode;
  headerProps: PublicHeaderProps;
  footerProps: PublicFooterProps;
}

export const PublicShell = ({ children, headerProps, footerProps }: PublicShellProps) => {
  return (
    <Box 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}
    >
      <PublicHeader {...headerProps} />
      
      <Box component="main" style={{ flex: 1 }}>
        {children}
      </Box>

      <PublicFooter {...footerProps} />
    </Box>
  );
};
