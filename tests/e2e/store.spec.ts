import { test, expect } from "@playwright/test";

test("agregar al carrito y completar un pedido con pago mock", async ({
  page,
}) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();

  // Contexto nuevo: descartar el banner de cookies para que no intercepte clics.
  const cookieDialog = page.getByRole("dialog", {
    name: "Consentimiento de cookies",
  });
  if (await cookieDialog.isVisible()) {
    await cookieDialog.getByRole("button", { name: /Aceptar/ }).click();
  }

  // Una pieza con precio visible (el precio formateado es "$…", fuera del <a>).
  const pricedCard = page
    .locator("article")
    .filter({ hasText: /\$\s?\d/ })
    .first();
  await expect(pricedCard).toBeVisible();
  await pricedCard
    .locator('a[href^="/producto/"]')
    .first()
    .click();
  await page.waitForURL("**/producto/**");

  await page.getByRole("button", { name: "Añadir y pedir" }).click();

  await page.goto("/checkout");
  await expect(
    page.getByRole("heading", { name: "Finalizar compra" })
  ).toBeVisible();

  await page.getByLabel("Correo electrónico").fill("cliente@ejemplo.com");
  await page.getByLabel("Nombre del destinatario").fill("Cliente de Prueba");
  await page.getByLabel("Dirección").fill("Calle 10 # 20-30");
  await page.getByLabel("Ciudad").fill("Bogotá");

  await page
    .getByRole("button", { name: /Continuar al pago/ })
    .click();

  await expect(
    page.getByText(/Pago con tarjeta/)
  ).toBeVisible();

  await page.getByRole("button", { name: /Pagar/ }).click();

  await page.waitForURL("**/checkout/exito?order=*");
  await expect(
    page.getByRole("heading", { name: "Pedido confirmado" })
  ).toBeVisible();
  await expect(page.getByText("Pagado")).toBeVisible();
});