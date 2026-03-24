import { Box, Container, Paper, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface ScrollSectionProps {
  backgroundImage: string;
  title: string;
  children: ReactNode;
  id?: string;
}

export function ScrollSection({ backgroundImage, title, children, id }: ScrollSectionProps) {
  return (
    <Box id={id} style={{ backgroundColor: '#f8f9fa' }}>
      <Container size="lg" px={0} style={{ position: 'relative' }}>
        <Box 
          style={{ 
            minHeight: '100vh', 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 1
            }} 
          />

          <Container size="lg" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <Paper 
              p={{ base: 'xl', md: 50 }} 
              radius="lg" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.92)', 
                backdropFilter: 'blur(8px)',
                maxWidth: '800px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}
            >
          <Stack gap="xl">
            <Title order={2} size={42} fw={900} style={{ letterSpacing: '-1px' }} c="brand.7">
              {title}
            </Title>
            <Box style={{ lineHeight: 1.8 }}>
              {children}
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  </Container>
</Box>
  );
}
