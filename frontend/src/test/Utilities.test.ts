import { describe, it, expect } from 'vitest';
import { API_BASE_URL } from '../config';
import { theme } from '../theme';

describe('Configuration and Theme', () => {
  it('has a valid API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    // In test env it might be default
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('has a valid Mantine theme', () => {
    expect(theme.primaryColor).toBe('brand');
    expect(theme.colors?.brand).toHaveLength(10);
  });
});
