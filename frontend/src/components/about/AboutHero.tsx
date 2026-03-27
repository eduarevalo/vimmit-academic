import { Box, Container, Title, Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';

export function AboutHero() {
  return (
    <Box 
      style={{ 
        height: '60vh', 
        backgroundColor: '#1A1B1E',
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box 
        style={{ 
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 184, 137, 0.15) 0%, rgba(74, 184, 137, 0) 70%)',
          filter: 'blur(60px)',
          zIndex: 1
        }}
      />
      
      <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
        <Stack gap="md" maw={800}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Text 
              c="brand.4" 
              fw={800} 
              tt="uppercase" 
              lts={3} 
              size="sm"
            >
              Conoce nuestra institución
            </Text>
            <Title 
              order={1} 
              c="white" 
              size={72} 
              fw={900} 
              style={{ letterSpacing: '-2px', lineHeight: 1 }}
            >
              Comprometidos con el <Text span c="brand.5" inherit>Desarrollo Regional</Text>
            </Title>
            <Text size="xl" c="gray.4" mt="xl" style={{ lineHeight: 1.6 }}>
              Desde hace más de dos décadas, ASEDER ha sido el motor de cambio para miles de personas en el norte del Cauca, brindando educación de calidad y oportunidades de crecimiento.
            </Text>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
}
