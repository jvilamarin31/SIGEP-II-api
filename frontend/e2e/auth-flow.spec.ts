import { test, expect } from "./fixtures";

test("flujo completo de login, dashboard y cierre de sesión", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Iniciar sesión/i })).toBeVisible();
  await page.locator('[name="numeroIdentificacion"]').fill("1107843949");
  await page.locator('[name="contraseña"]').fill("secret123");
  await page.getByRole("button", { name: /Ingresar/i }).click();
  await expect(page.getByRole("heading", { name: /Hoja de Vida/i })).toBeVisible();
  await expect(page.getByText(/Secciones Completadas/i)).toBeVisible();
  await page.getByText(/Cerrar sesión/i).click();
  await expect(page.getByRole("heading", { name: /Iniciar sesión/i })).toBeVisible();
});
