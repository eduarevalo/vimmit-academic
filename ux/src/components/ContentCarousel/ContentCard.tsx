import React from 'react';
import { 
  Box, 
  Text, 
  Overlay, 
  Transition, 
  AspectRatio, 
  Image,
  Stack,
  ActionIcon,
  Group,
  Modal,
  Drawer,
  Badge,
  Button,
  rem,
  Divider,
  ScrollArea
} from '@mantine/core';
import { useHover, useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconPlayerPlay, IconPlus, IconX } from '@tabler/icons-react';

export interface ContentCardProps {
  title: string;
  description?: string;
  longDescription?: string;
  image: string;
  badge?: string;
  tags?: string[];
  onClick?: () => void;
  aspectRatio?: number;
}

export const ContentCard = ({ 
  title, 
  description, 
  longDescription,
  image, 
  badge, 
  tags = [],
  onClick,
  aspectRatio = 16 / 9
}: ContentCardProps) => {
  const { hovered, ref } = useHover();
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 48em)');

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      open();
    }
  };

  const SelectionContent = (
    <Stack gap="lg">
      <AspectRatio ratio={16 / 9} style={{ borderRadius: 'var(--mantine-radius-xs)', overflow: 'hidden' }}>
        <Image src={image} alt={title} />
      </AspectRatio>
      
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={3} fw={800}>{title}</Title>
            <Group gap="xs" mt={4}>
              {tags.map(tag => (
                <Badge key={tag} variant="light" color="gray" size="sm" radius="xs">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Box>
          {badge && <Badge color="brand" radius="xs">{badge}</Badge>}
        </Group>
        
        <Divider my="sm" />
        
        <Text size="sm" style={{ lineHeight: 1.6 }}>
          {longDescription || description}
        </Text>
      </Stack>

      <Group grow>
        <Button color="brand" leftSection={<IconPlayerPlay size={18} fill="currentColor" />} radius="xs">
          Comenzar ahora
        </Button>
        <Button variant="light" color="gray" leftSection={<IconPlus size={18} />} radius="xs">
          Mi Lista
        </Button>
      </Group>
    </Stack>
  );

  return (
    <>
      <Box
        ref={ref}
        onClick={handleCardClick}
        style={{
          position: 'relative',
          cursor: 'pointer',
          borderRadius: 'var(--mantine-radius-xs)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          zIndex: hovered ? 10 : 1,
          boxShadow: hovered ? 'var(--mantine-shadow-md)' : 'none',
        }}
      >
        <AspectRatio ratio={aspectRatio}>
          <Image src={image} alt={title} fallbackSrc="https://placehold.co/600x400?text=No+Image" />
        </AspectRatio>

        {badge && !hovered && (
          <Box
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: 'var(--mantine-color-brand-6)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 'var(--mantine-radius-xs)',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              zIndex: 2,
            }}
          >
            {badge}
          </Box>
        )}

        <Transition mounted={hovered} transition="fade" duration={200}>
          {(styles) => (
            <Overlay
              style={styles}
              gradient="linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)"
              opacity={1}
            >
              <Stack 
                justify="flex-end" 
                h="100%" 
                p="md" 
                gap="xs"
              >
                <Group justify="space-between" align="flex-end">
                  <Box style={{ flex: 1 }}>
                    <Text c="white" fw={700} size="sm" lineClamp={1}>
                      {title}
                    </Text>
                    {description && (
                      <Text c="gray.3" size="xs" lineClamp={2}>
                        {description}
                      </Text>
                    )}
                  </Box>
                  <ActionIcon 
                    variant="white" 
                    color="brand" 
                    radius="xs" 
                    size="md"
                  >
                    <IconPlayerPlay size={16} fill="currentColor" />
                  </ActionIcon>
                </Group>
              </Stack>
            </Overlay>
          )}
        </Transition>
      </Box>

      {/* Quick View - Drawer Style on Mobile, Modal on Desktop */}
      {isMobile ? (
        <Drawer
          opened={opened}
          onClose={close}
          position="bottom"
          size="75%"
          radius="md"
          padding="xl"
          title={<Text fw={900} size="lg">Detalles del contenido</Text>}
          styles={{
            header: { borderBottom: '1px solid var(--mantine-color-gray-2)', marginBottom: rem(20) },
            content: { borderRadius: '24px 24px 0 0' }
          }}
        >
          <ScrollArea h="100%" mx="-xl" px="xl">
            {SelectionContent}
          </ScrollArea>
        </Drawer>
      ) : (
        <Modal
          opened={opened}
          onClose={close}
          size="lg"
          radius="xs"
          withCloseButton={false}
          padding={0}
          transitionProps={{ transition: 'pop' }}
        >
          <Box p="xl" style={{ position: 'relative' }}>
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={close} 
              style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
            >
              <IconX size={20} />
            </ActionIcon>
            {SelectionContent}
          </Box>
        </Modal>
      )}
    </>
  );
};

import { Title } from '@mantine/core';

ContentCard.displayName = 'ContentCard';
