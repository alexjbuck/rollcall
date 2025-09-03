import { expect, test } from "@playwright/test";

test("landing page renders and shows CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "RollCall" })).toBeVisible();
  // Shows either dashboard or sign-in link depending on session; unauth shows sign-in
  await expect(
    page.getByRole("link", { name: /Go to dashboard|Sign in with Google/ }),
  ).toBeVisible();
});

test("no server error in landing page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const res = await page.goto("/");
  expect(res?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "RollCall" })).toBeVisible();
  expect(errors).toEqual([]);
});
