// One-line tap macros shared by every suite. Macros use TAP signals only.
// Split into one file per product area as flows grow (e.g. checkout-flows.ts).
// Needs @playwright/test, which is installed only after the owner approves it.

import type { Page } from '@playwright/test';
import { tapSelector, type TapSignal } from '../registry/tap-signals';
import { VIEWPORTS, type ViewportName } from '../registry/viewports';

export async function tap(page: Page, signal: TapSignal): Promise<void> {
  await page.locator(tapSelector(signal)).click();
}

export async function waitForSignal(page: Page, signal: TapSignal): Promise<void> {
  await page.locator(tapSelector(signal)).waitFor();
}

export async function useViewport(page: Page, name: ViewportName): Promise<void> {
  await page.setViewportSize(VIEWPORTS[name]);
}

// Example flow macro, to replace once the first real flow exists:
// export async function loginAs(page: Page, persona: 'user' | 'admin'): Promise<void> {
//   await page.goto('/login');
//   ...fill the persona's test credentials, then:
//   await waitForSignal(page, 'app.shell.ready');
// }
