import { test, expect } from "@playwright/test";
test("public routes, guarded mutations, dish lifecycle, uploads and tracking", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error" && /hydration|hydrated|didn't match/i.test(message.text())) errors.push(message.text()); });
  const blocked = await request.post("/api/admin/menu", { data: {} });
  expect(blocked.status()).toBe(403);
  expect((await request.post("/api/admin/uploads", { data: "x" })).status()).toBe(403);
  for (const route of ["/", "/menu", "/about", "/gallery", "/contact", "/press", "/faq", "/private-dining", "/privacy"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator(".site-header")).toBeVisible();
  }
  await page.goto("/menu");
  await expect(page.locator(".menu-item")).toHaveCount(84);
  await page.evaluate(() => { window.addEventListener("angel:analytics", event => { document.body.dataset.lastEvent = JSON.stringify((event as CustomEvent).detail); }); });
  await page.getByRole("button", { name: "Appetizers", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute("data-last-event", /menu_filter/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Menu +" }).click();
  await expect(page.locator("#mobile-navigation")).toHaveAttribute("data-open", "true");
  await page.getByRole("button", { name: "Close −" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/public-menu-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/menu/new");
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByLabel("Administrator access key").fill("angel-local-e2e-only-access-key-2026");
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.locator(".site-header")).toHaveCount(0);
  await page.screenshot({ path: "test-results/admin-dashboard.png", fullPage: true });
  const originFailure = await page.request.post("/api/admin/menu", { headers: { origin: "https://untrusted.example" }, data: {} });
  expect(originFailure.status()).toBe(403);
  const fakeImage = await page.request.post("/api/admin/uploads", { headers: { origin: "http://127.0.0.1:3100", "Content-Type": "image/png" }, data: "not an image" });
  expect(fakeImage.status()).toBe(400);

  for (const special of [false, true]) {
    const name = special ? "QA Chef Special" : "QA Regular Dish";
    await page.goto("/admin/menu/new");
    await page.getByLabel("Dish name", { exact: true }).fill(name);
    await page.getByLabel("Description", { exact: true }).fill("A temporary test dish.");
    await page.getByLabel("Price (USD)").fill("12.34");
    await page.getByLabel("Category", { exact: true }).selectOption("appetizers-vegetarian");
    if (special) {
      await page.getByLabel("Dish type").selectOption("chef-special");
      await page.getByRole("button", { name: "Create dish", exact: true }).click();
      await expect(page.locator(".admin-error")).toContainText("Upload an image");
      await page.locator('input[type="file"]').setInputFiles("public/angel/chicken-biryani-stock.webp");
      await expect(page.getByAltText("Dish image preview")).toBeVisible();
      await page.getByAltText("Dish image preview").scrollIntoViewIfNeeded();
      await expect.poll(() => page.getByAltText("Dish image preview").evaluate((image: HTMLImageElement) => image.naturalWidth), { timeout: 15000 }).toBeGreaterThan(0);
    }
    const createRequest = page.waitForRequest(request => request.method() === "POST" && request.url().endsWith("/api/admin/menu"));
    await page.getByRole("button", { name: "Create dish", exact: true }).click();
    const submitted = (await createRequest).postDataJSON() as Record<string, unknown>;
    await expect(page).toHaveURL(/\/admin\/menu\?saved=1/);
    await expect(page.getByRole("status")).toContainText("Dish saved");
    expect((await page.request.post("/api/admin/menu", { headers: { origin: "http://127.0.0.1:3100" }, data: submitted })).status()).toBe(400);
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(/\/edit$/, { timeout: 60000 });
    const editUrl = page.url();
    const staleEditor = special ? null : await page.context().newPage();
    if (staleEditor) { await staleEditor.goto(editUrl); await expect(staleEditor.getByLabel("Price (USD)")).toBeVisible(); }
    await page.goto("/menu");
    await expect(page.locator(".menu-item").filter({ hasText: name })).toContainText("$12.34");
    if (special) await expect(page.locator(".dish-card").filter({ hasText: name })).toBeVisible();
    if (special) {
      await page.goto("/");
      await page.evaluate(() => { window.addEventListener("angel:analytics", event => { document.body.dataset.lastEvent = JSON.stringify((event as CustomEvent).detail); }); });
      await page.getByRole("button", { name: new RegExp(name) }).click();
      await expect(page.locator("body")).toHaveAttribute("data-last-event", /chef_special_click/);
    }
    await page.goto(editUrl);
    await page.getByLabel("Price (USD)").fill("14.56");
    if (special) {
      const previousImage = await page.getByAltText("Dish image preview").getAttribute("src");
      await page.locator('input[type="file"]').setInputFiles("public/angel/goat-biryani-stock.webp");
      await expect(page.getByAltText("Dish image preview")).not.toHaveAttribute("src", previousImage!);
    }
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/saved=1/);
    if (staleEditor) {
      await staleEditor.getByLabel("Price (USD)").fill("99.99");
      await staleEditor.getByRole("button", { name: "Save changes" }).click();
      await expect(staleEditor.locator(".admin-error")).toContainText("changed or was deleted");
      await staleEditor.close();
    }
    await page.goto("/menu");
    await expect(page.locator(".menu-item").filter({ hasText: name })).toContainText("$14.56");
    await page.goto("/admin/menu");
    await page.getByRole("button", { name: `Toggle availability for ${name}`, exact: true }).click();
    await expect(page.getByRole("button", { name: `Toggle availability for ${name}`, exact: true })).toHaveAttribute("aria-pressed", "false");
    await page.goto("/menu");
    await expect(page.getByText(name, { exact: true })).toHaveCount(0);
    await page.goto("/admin/menu");
    await page.getByRole("button", { name: `Toggle availability for ${name}`, exact: true }).click();
    await expect(page.getByRole("button", { name: `Toggle availability for ${name}`, exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: `Toggle visibility for ${name}`, exact: true }).click();
    await expect(page.getByRole("button", { name: `Toggle visibility for ${name}`, exact: true })).toHaveAttribute("aria-pressed", "false");
    await page.goto("/menu");
    await expect(page.getByText(name, { exact: true })).toHaveCount(0);
    await page.goto("/admin/menu");
    await page.getByRole("row").filter({ hasText: name }).getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.getByRole("row").filter({ hasText: name })).toBeVisible();
    await page.getByRole("row").filter({ hasText: name }).getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("button", { name: "Delete dish", exact: true }).click();
    await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(0);
  }
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/admin/menu");
  await page.getByLabel("Search dishes").fill("QA");
  await expect(page.getByText("No dishes found.")).toBeVisible();
  await page.getByLabel("Search dishes").fill("");
  await expect(page.locator("tbody tr")).toHaveCount(84);
  await page.screenshot({ path: "test-results/admin-menu-tablet.png", fullPage: true, caret: "initial" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/admin/analytics");
  await expect(page.getByText("No imported reporting data")).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(errors).toEqual([]);
});

test("public menu and homepage keep content visible and images optimized", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator(".dish-preview").scrollIntoViewIfNeeded();
  await expect(page.locator(".dish-preview")).toHaveCSS("opacity", "1");
  await expect.poll(() => page.locator(".dish-preview-frame.is-active img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.goto("/menu");
  await page.locator(".menu-list-section").first().scrollIntoViewIfNeeded();
  await expect(page.locator(".menu-list-head").first()).toHaveCSS("opacity", "1");
  await expect(page.locator(".menu-item")).toHaveCount(84);
});
