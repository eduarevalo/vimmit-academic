import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { getTranslations, t } from '../utils/i18n';

const { Given, When, Then } = createBdd(test);

// Context-aware translation helper
async function getT(page: any) {
  const locale = await page.evaluate(() => navigator.language);
  const translations = getTranslations(locale);
  return (key: string) => t(translations, key);
}

Given('I am on the enrollment page', async ({ page }) => {
  const locale = await page.evaluate(() => navigator.language);
  const language = locale.split('-')[0];
  await page.goto(`/admissions?lng=${language}`);
});

Then('I should be on the personal details step', async ({ page }) => {
  const tr = await getT(page);
  await expect(page.getByText(tr('registration.steps.details')).first()).toBeVisible();
});

When('I fill in my personal details:', async ({ page }, table) => {
  const tr = await getT(page);
  const data = table.rowsHash();
  
  await page.getByLabel(tr('registration.fields.fullName')).fill(data.fullName);
  await page.getByLabel(tr('registration.fields.email')).fill(data.email);
  await page.getByLabel(tr('registration.fields.phone')).fill(data.phone);
});

When('I click {string}', async ({ page }, label) => {
  const tr = await getT(page);
  let buttonText = label;
  
  if (label === 'Next') buttonText = tr('common.next');
  if (label === 'Start') buttonText = tr('registration.start');
  
  const button = page.getByRole('button', { name: buttonText }).first();
  await expect(button).toBeVisible({ timeout: 10000 });
  await button.click();
});

Then('I should be on the program selection step', async ({ page }) => {
  const tr = await getT(page);
  await expect(page.getByText(tr('registration.steps.selection')).first()).toBeVisible();
});

When('I select campus {string}, program {string}, and calendar {string}', async ({ page }, campus, program, calendar) => {
  const tr = await getT(page);
  
  // Select Campus — wait for it to appear (mocked campuses load instantly)
  const campusInput = page.getByLabel(tr('registration.fields.campus')).first();
  await campusInput.waitFor({ state: 'visible', timeout: 15000 });
  await campusInput.click();
  await page.getByRole('option', { name: campus }).click();
  
  // Select Program — use .first() to avoid strict mode violation with the open listbox
  await page.getByLabel(tr('registration.fields.program')).first().click();
  await page.getByRole('option', { name: program }).click();
  
  // Select Calendar — same pattern
  await page.getByLabel(tr('registration.fields.calendar')).first().click();
  await page.getByRole('option', { name: calendar }).click();
});

Then('I should be on the document upload step', async ({ page }) => {
  const tr = await getT(page);
  await expect(page.getByText(tr('registration.steps.docs')).first()).toBeVisible();
});

Then('I should see the required documents for the program', async ({ page }) => {
  const tr = await getT(page);
  await expect(page.getByText(tr('registration.program.requirementsTitle')).first()).toBeVisible();
});
