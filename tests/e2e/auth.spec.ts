import { test, expect } from "@playwright/test";

export const ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL ?? "admin@esmeraldasgold.com";
export const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ?? "Admin#Esmeraldas2026";

test("tienda pública: / y /catalogo responden", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Esmeraldas\s*Gold/i }).first()
  ).toBeVisible();
});

test("el administrador inicia sesión y ve el dashboard", async ({ page }) => {
  await page.goto("/acceso");

  await page.getByLabel("Correo electrónico").fill(ADMIN_EMAIL);
  await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await page.waitForURL("**/admin**");
  await expect(
    page.getByRole("heading", { name: "Dashboard" })
  ).toBeVisible();
});

test("una sesión anónima no puede abrir el panel admin", async ({ page }) => {
  await page.goto("/admin/productos");
  await expect(page).toHaveURL(/\/acceso/);
});