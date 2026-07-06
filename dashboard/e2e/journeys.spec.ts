import { test, expect } from '@playwright/test'

// Core user journeys for the Phase-1 demo. Run against the production preview build.
// The app is a state-based multi-page shell: Home is the landing page, the demo
// sign-in lives on the Login screen, and a signed-in demo user lands on the
// dashboard (and returns there on reload, since auth + setup persist locally).

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Landing → Login → demo sign-in (guest) → dashboard.
  await page.getByRole('button', { name: 'Get started' }).first().click()
  await page.getByRole('button', { name: 'Explore the demo' }).click()
  await expect(page.getByRole('heading', { name: 'GridSense AI' })).toBeVisible()
})

test('Live Now: power, cost, tier-cliff alert, tier gauge', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'GridSense AI' })).toBeVisible()
  await expect(page.getByText('Live power', { exact: true })).toBeVisible()
  await expect(page.getByText('kW', { exact: false }).first()).toBeVisible()
  // marginal rate shown must be one of the VERIFIED RURA tiers
  await expect(page.getByText(/next unit costs (89|310|369) RWF/)).toBeVisible()
  await expect(page.getByText('Where you are in the tiers')).toBeVisible()
  // cliff alert references the next tier rate
  await expect(page.getByText(/RWF\/kWh tier/).first()).toBeVisible()
})

test('This Month: cumulative chart + tier crossing', async ({ page }) => {
  // already on the dashboard from beforeEach; switch tabs
  await page.getByRole('button', { name: /This Month/ }).click()
  await expect(page.getByText('Cumulative consumption vs the tier thresholds')).toBeVisible()
  await expect(page.getByText('Forecast bill')).toBeVisible()
  await expect(page.getByText('Tier crossing')).toBeVisible()
})

test('Appliances: sourced breakdown ranks water heater + fridge', async ({ page }) => {
  await page.getByRole('button', { name: /Appliances/ }).click()
  await expect(page.getByText('Estimated monthly share by appliance')).toBeVisible()
  await expect(page.getByText('Water heater', { exact: true })).toBeVisible()
  await expect(page.getByText('Refrigerator', { exact: true })).toBeVisible()
  // water heater monthly estimate is the sourced ~59 kWh (deterministic)
  await expect(page.getByText(/59 kWh/)).toBeVisible()
})

test('Save: recommendations with estimated RWF ranges', async ({ page }) => {
  await page.getByRole('button', { name: /Save/ }).click()
  await expect(page.getByText('Personalized savings advice')).toBeVisible()
  await expect(page.getByText(/\(est\.\)/).first()).toBeVisible()
  // at least one recommendation card with an impact figure
  await expect(page.getByText(/RWF/).first()).toBeVisible()
})

test('Language: EN → Kinyarwanda toggle shows draft badge + RW nav, and back', async ({ page }) => {
  await page.getByRole('button', { name: 'RW', exact: true }).first().click()
  await expect(page.getByText(/Ikinyarwanda/)).toBeVisible() // honest draft badge
  await expect(page.getByText('Ibikoresho')).toBeVisible() // nav translated
  await page.getByRole('button', { name: 'EN', exact: true }).first().click()
  await expect(page.getByText('Appliances')).toBeVisible()
})
