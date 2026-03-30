import { renderHook } from '@testing-library/react';
import { useInstitution } from '../useInstitution';
import { describe, it, expect } from 'vitest';

describe('useInstitution', () => {
  it('returns the correct institution data', () => {
    const { result } = renderHook(() => useInstitution());
    expect(result.current.name).toBe('Aseder');
    expect(result.current.loading).toBe(false);
    expect(result.current.socials.facebook).toBeDefined();
  });
});
