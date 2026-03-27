import { AboutHero } from '../components/about/AboutHero';
import { StatsSection } from '../components/about/StatsSection';
import { HistorySection } from '../components/about/HistorySection';
import { MissionVision } from '../components/about/MissionVision';
import { Stack } from '@mantine/core';

export function AboutPage() {
  return (
    <Stack gap={0}>
      <AboutHero />
      <StatsSection />
      <HistorySection />
      <MissionVision />
    </Stack>
  );
}
