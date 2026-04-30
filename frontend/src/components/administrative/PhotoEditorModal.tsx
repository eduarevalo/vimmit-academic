import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Modal, Button, Group, Stack, Slider, Text, Box, 
  Title, Divider, SegmentedControl, ThemeIcon, Center 
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { 
  IconReload, IconDeviceFloppy, IconWand, IconCrop, 
  IconAdjustmentsHorizontal, IconRotateClockwise,
  IconBrightnessUp, IconContrast 
} from '@tabler/icons-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface PhotoEditorModalProps {
  opened: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (blob: Blob) => void;
  processing?: boolean;
  aspect?: number; // Optional aspect ratio (e.g. 1 for square, 3/4 for ID photo)
}

export function PhotoEditorModal({ 
  opened, 
  onClose, 
  imageUrl, 
  onSave, 
  processing,
  aspect = 1 // Default to free or 1:1, we can pass null for free
}: PhotoEditorModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<'crop' | 'filters'>('crop');
  
  // States for filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [hasRemovedBg, setHasRemovedBg] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // States for cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectState, setAspectState] = useState<number | undefined>(aspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (opened && imageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        setOriginalImage(img);
        setBrightness(100);
        setContrast(100);
        setRotation(0);
        setHasRemovedBg(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setMode('crop');
        setAspectState(aspect);
      };
    }
  }, [opened, imageUrl, aspect]);

  // Handle canvas drawing for filters mode
  useEffect(() => {
    if (mode === 'filters' && originalImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas and draw
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(originalImage, 0, 0);
      }
    }
  }, [mode, originalImage, brightness, contrast]);

  const onCropComplete = useCallback((_set: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleRemoveBackground = async () => {
    if (!originalImage) return;
    setIsRemovingBg(true);

    try {
      const imgly = await import('@imgly/background-removal');
      
      // We pass the original image or current canvas? 
      // Usually better to remove BG from original and then apply crops/filters
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const transparentBlob = await imgly.removeBackground(blob);
      const url = URL.createObjectURL(transparentBlob);
      
      const newImg = new window.Image();
      newImg.onload = () => {
        setOriginalImage(newImg);
        setHasRemovedBg(true);
        URL.revokeObjectURL(url);
      };
      newImg.src = url;
    } catch (error) {
      console.error("Error removing background:", error);
      alert(t('portal.photoEditor.errorAi'));
    } finally {
      setIsRemovingBg(false);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async () => {
    if (!originalImage || !croppedAreaPixels) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Set background if BG was removed
    if (hasRemovedBg) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Apply filters to context before drawing
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Handle rotation on canvas if needed, or rely on react-easy-crop results
    // react-easy-crop doesn't rotate the image data itself in croppedAreaPixels
    // We usually need to perform the transformation here
    const scale = 1;
    const rotateRad = (rotation * Math.PI) / 180;

    ctx.drawImage(
      originalImage,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    const blob = await getCroppedImg();
    if (blob) onSave(blob);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspectState(aspect);
    if (hasRemovedBg) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        setOriginalImage(img);
        setHasRemovedBg(false);
      };
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={t('portal.photoEditor.title')}
      size="xl"
      radius={isMobile ? 0 : "md"}
      centered
      fullScreen={isMobile}
    >
      <Stack gap={isMobile ? "md" : "lg"}>
        <Box 
          style={{ 
            backgroundColor: '#1A1B1E', 
            borderRadius: isMobile ? 0 : 12, 
            overflow: 'hidden', 
            height: isMobile ? 300 : 400,
            position: 'relative'
          }}
        >
          {mode === 'crop' ? (
             <Cropper
                image={originalImage?.src || imageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectState}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
          ) : (
            <Box style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <canvas 
                  ref={canvasRef} 
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    backgroundColor: '#fff' 
                  }} 
                  width={originalImage?.width || 800}
                  height={originalImage?.height || 600}
               />
               <Text c="white" size="xs" pos="absolute" bottom={10}>{t('portal.photoEditor.preview')}</Text>
            </Box>
          )}
        </Box>

        <Group justify="center">
          <SegmentedControl
            value={mode}
            onChange={(val: any) => setMode(val)}
            data={[
              { 
                label: (
                  <Center style={{ gap: 8 }}>
                    <IconCrop size={16} />
                    <span>{t('portal.photoEditor.crop')}</span>
                  </Center>
                ), 
                value: 'crop' 
              },
              { 
                label: (
                  <Center style={{ gap: 8 }}>
                    <IconAdjustmentsHorizontal size={16} />
                    <span>{t('portal.photoEditor.adjustments')}</span>
                  </Center>
                ), 
                value: 'filters' 
              },
            ]}
            radius="xs"
            size={isMobile ? "sm" : "md"}
            color="brand"
          />
        </Group>

        {mode === 'crop' && (
           <Stack gap="sm">
              <Group grow={!isMobile} align="flex-end">
                <Stack gap={2}>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('portal.photoEditor.zoom')}</Text>
                  <Slider 
                    value={zoom} 
                    onChange={setZoom} 
                    min={1} 
                    max={3} 
                    step={0.1}
                    label={(val) => `${val.toFixed(1)}x`}
                    color="brand"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                    <Group gap={4}><IconRotateClockwise size={12} /> {t('portal.photoEditor.rotation')}</Group>
                  </Text>
                  <Slider 
                    value={rotation} 
                    onChange={setRotation} 
                    min={0} 
                    max={360} 
                    step={1}
                    label={(val) => `${val}°`}
                    color="teal"
                  />
                </Stack>
              </Group>

              <Divider label={t('portal.photoEditor.aspectRatio')} labelPosition="left" />
              <SegmentedControl
                size="xs"
                value={aspectState?.toString() || 'free'}
                onChange={(val) => setAspectState(val === 'free' ? undefined : parseFloat(val))}
                data={[
                  { label: t('portal.photoEditor.aspectFree'), value: 'free' },
                  { label: t('portal.photoEditor.aspectSquare'), value: '1' },
                  { label: t('portal.photoEditor.aspectPortrait'), value: (3/4).toString() },
                  { label: t('portal.photoEditor.aspectLandscape'), value: (16/9).toString() },
                ]}
              />
           </Stack>
        )}

        {mode === 'filters' && (
          <>
            <Divider label={t('portal.photoEditor.controls')} labelPosition="center" />
            <Group grow align="flex-start">
              <Stack gap="xs">
                <Group gap="xs" mb={-8}>
                  <IconBrightnessUp size={16} />
                  <Text size="xs" fw={700} tt="uppercase">{t('portal.photoEditor.brightness')}</Text>
                </Group>
                <Slider 
                  value={brightness} 
                  onChange={setBrightness} 
                  min={50} 
                  max={150} 
                  label={(val) => `${val}%`}
                  color="blue"
                />

                <Group gap="xs" mb={-8} mt="sm">
                  <IconContrast size={16} />
                  <Text size="xs" fw={700} tt="uppercase">{t('portal.photoEditor.contrast')}</Text>
                </Group>
                <Slider 
                  value={contrast} 
                  onChange={setContrast} 
                  min={50} 
                  max={150} 
                  label={(val) => `${val}%`}
                  color="indigo"
                />
              </Stack>

              <Stack gap="xs" justify="center">
                <Group gap="xs" mb={-8}>
                  <IconWand size={16} />
                  <Text size="xs" fw={700} tt="uppercase">{t('portal.photoEditor.backgroundAi')}</Text>
                </Group>
                
                <Button 
                   variant="light" 
                   color="teal" 
                   onClick={handleRemoveBackground}
                   loading={isRemovingBg}
                   mt="sm"
                   size="xs"
                >
                  {isRemovingBg ? t('portal.photoEditor.processing') : t('portal.photoEditor.removeBackground')}
                </Button>
                
                <Text size="10px" c="dimmed">
                  {t('portal.photoEditor.backgroundNotice')}
                </Text>
              </Stack>
            </Group>
          </>
        )}

        <Divider />

        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconReload size={16} />} onClick={handleReset} color="gray">
            {t('portal.photoEditor.reset')}
          </Button>
          <Group>
            <Button variant="default" onClick={onClose} radius="xs">{t('common.cancel')}</Button>
            <Button 
              leftSection={<IconDeviceFloppy size={18} />} 
              onClick={handleSave} 
              color="brand"
              loading={processing}
              radius="xs"
            >
              {t('portal.photoEditor.confirm')}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
