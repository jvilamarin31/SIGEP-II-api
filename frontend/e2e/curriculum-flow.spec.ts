import { test, expect } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.locator('[name="numeroIdentificacion"]').fill("1107843949");
  await page.locator('[name="contraseña"]').fill("secret123");
  await page.getByRole("button", { name: /Ingresar/i }).click();
  await expect(page.getByRole("heading", { name: /Hoja de Vida/i })).toBeVisible();
});

test("usuario recorre secciones principales del currículum", async ({ page }) => {
  await page.getByText("Datos Personales").click();
  await expect(page.getByRole("heading", { name: /Datos Personales/i })).toBeVisible();
  await page.getByRole("button", { name: /Actualizar|Crear/i }).click();
  await expect(page.getByText(/Información guardada correctamente/i)).toBeVisible();

  await page.getByText("Educación").click();
  await expect(page.getByRole("heading", { name: /Educación/i })).toBeVisible();
  await page.getByRole("button", { name: /Agregar otra formación/i }).click();
  await expect(page.getByText(/Formación #2/i)).toBeVisible();

  await page.getByText("Experiencia Laboral").click();
  await expect(page.getByRole("heading", { name: /Experiencia Laboral/i })).toBeVisible();
  await page.getByRole("button", { name: /Agregar otra experiencia/i }).click();
  await expect(page.getByText(/Experiencia laboral #2/i)).toBeVisible();

  await page.getByText("Gerencia Pública").click();
  await expect(page.getByRole("heading", { name: /Gerencia Pública/i })).toBeVisible();
});
