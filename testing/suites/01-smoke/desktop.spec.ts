// Smoke: a first visit starts, the player sits down, and incident 1.1 shows in the Incident window.
// Runs in both projects in playwright.config.ts (desktop 1440 and phone 375), with reduced motion.
import { expect, test } from "@playwright/test";
import { challengeById } from "../../../data/challenges";
import { tap, waitForSignal } from "../../macros/flows";
import { tapSelector } from "../../registry/tap-signals";

test("a first visit reaches incident 1.1", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/");

  // Reduced motion skips the walk-in clip, so the desk still waits for a tap.
  await tap(page, "app.room.sit-down");
  await waitForSignal(page, "app.shell.ready");

  // The tutorial starts with 1.1. Its dim overlay takes taps, so wait until it has gone.
  await tap(page, "app.guide.skip-tutorial");
  await page.locator(tapSelector("app.guide.skip-tutorial")).waitFor({ state: "detached" });

  await tap(page, "app.desktop.open-incident");
  const incident = page.locator(tapSelector("app.window.incident"));
  await expect(incident).toBeVisible();
  // The title bar always says "Incident", so check for 1.1 itself.
  await expect(incident).toContainText(challengeById("1.1")!.title);

  expect(errors).toEqual([]);
});
