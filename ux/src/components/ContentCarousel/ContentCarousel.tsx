import React from 'react';
import { Carousel, CarouselProps } from '@mantine/carousel';
import { Box, rem } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import '@mantine/carousel/styles.css';

export interface ContentCarouselProps extends CarouselProps {
  children: React.ReactNode;
}

export const ContentCarousel = ({ children, ...others }: ContentCarouselProps) => {
  const isMobile = useMediaQuery('(max-width: 48em)');

  return (
    <Box
      style={{
        padding: `${rem(20)} 0`,
        margin: `-${rem(20)} 0`,
      }}
    >
      <Carousel
        slideSize={{ 
          base: '85%', // Show more peek on mobile
          sm: '33.333333%', 
          md: '25%', 
          lg: '20%' 
        }}
        slideGap={{ base: 'sm', sm: 'md' }}
        align="start"
        slidesToScroll={isMobile ? 1 : 'auto'}
        nextControlIcon={<IconChevronRight size={isMobile ? 24 : 32} />}
        previousControlIcon={<IconChevronLeft size={isMobile ? 24 : 32} />}
        controlsOffset={isMobile ? 'xs' : -10}
        loop
        dragFree={isMobile} // Better for touch
        styles={{
          control: {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid var(--mantine-color-gray-2)',
            boxShadow: 'var(--mantine-shadow-sm)',
            transition: 'all 0.2s ease',
            opacity: isMobile ? 1 : 0, // Hidden on desktop until hover
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: 'var(--mantine-color-white)',
            },
          },
          root: {
            '&:hover .mantine-Carousel-control': {
              opacity: 1,
            },
          },
          viewport: {
            overflow: 'visible',
          },
        }}
        {...others}
      >
        {React.Children.map(children, (child) => (
          <Carousel.Slide>{child}</Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
};

ContentCarousel.displayName = 'ContentCarousel';
