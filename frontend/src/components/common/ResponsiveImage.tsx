import { Image, Box } from '@mantine/core';
import type { ImageProps } from '@mantine/core';
import React from 'react';

interface ResponsiveImageProps extends Omit<ImageProps, 'src'> {
  /** Base path without extension, e.g., '/assets/photo' */
  srcSetBase: string;
  /** Original fallback extension, e.g., 'png' or 'jpg' */
  fallbackExt: 'png' | 'jpg' | 'jpeg';
  /** Alternative text */
  alt: string;
  /** Aspect ratio */
  ratio?: number;
}

/**
 * A highly optimized responsive image component.
 * Expects variants: -sm.webp (400px), -md.webp (800px), -lg.webp (1200px)
 * and a standard fallback file.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ 
  srcSetBase, 
  fallbackExt, 
  alt, 
  ratio,
  style, 
  ...mantineProps 
}) => {
  const webpSm = `${srcSetBase}-sm.webp`;
  const webpMd = `${srcSetBase}-md.webp`;
  const webpLg = `${srcSetBase}-lg.webp`;
  const fallback = `${srcSetBase}.${fallbackExt}`;

  return (
    <Box style={{ overflow: 'hidden', ...style }}>
      <picture>
        {/* Modern WebP formats with size hints */}
        <source 
          type="image/webp" 
          media="(min-width: 1200px)" 
          srcSet={webpLg} 
        />
        <source 
          type="image/webp" 
          media="(min-width: 640px)" 
          srcSet={webpMd} 
        />
        <source 
          type="image/webp" 
          srcSet={webpSm} 
        />
        
        {/* Standard Fallback using Mantine Image for consistent styling */}
        <Image 
          src={fallback} 
          alt={alt} 
          loading="lazy" 
          decoding="async"
          {...mantineProps} 
        />
      </picture>
    </Box>
  );
};
