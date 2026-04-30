import { test as base } from 'playwright-bdd';
import {
  MOCK_CAMPUSES,
  MOCK_PROGRAMS,
  MOCK_CALENDARS,
  MOCK_ADMISSION,
} from './mocks/api';

/**
 * Extended Playwright test fixture that intercepts all backend API calls
 * and responds with mock data. This makes E2E tests fully independent
 * from the backend server.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // --- Campuses ---
    await page.route('**/v1/organization/campuses/public/**', async (route) => {
      await route.fulfill({ json: MOCK_CAMPUSES });
    });

    // --- Programs (with optional query params) ---
    await page.route('**/v1/academic/programs/public/**', async (route) => {
      await route.fulfill({ json: MOCK_PROGRAMS });
    });

    // --- Academic Calendars (with optional query params) ---
    await page.route('**/v1/calendar/academic-periods/public/**', async (route) => {
      await route.fulfill({ json: MOCK_CALENDARS });
    });

    // --- Admissions: Create (POST) + Update/Attachments (PATCH) ---
    // Single handler on the widest pattern to avoid LIFO override issues:
    // Playwright applies handlers in reverse registration order, so two
    // overlapping patterns would cause the later one to shadow the earlier.
    await page.route('**/v1/administrative/admissions/public/**', async (route) => {
      const method = route.request().method();
      if (method === 'POST' || method === 'PATCH') {
        await route.fulfill({ json: MOCK_ADMISSION });
      } else {
        await route.continue();
      }
    });

    // --- Institution info (slug resolution) ---
    await page.route('**/v1/tenants/**', async (route) => {
      await route.fulfill({
        json: {
          id: 'tenant-test-1',
          name: 'Institución Demo',
          slug: 'aseder',
        },
      });
    });

    await use(page);
  },
});
