import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import ChangePasswordPage from "./ChangePasswordPage";

describe("ChangePasswordPage", () => {
  it("valida y cambia contraseña", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<ChangePasswordPage />, { authenticated: true, route: "/perfil/cambiar-contrasena" });
    await user.click(screen.getByRole("button", { name: /Guardar contraseña/i }));
    expect(screen.getByText(/mínimo 6/i)).toBeInTheDocument();

    const inputs = container.querySelectorAll("input");
    await user.type(inputs[0], "secret123");
    await user.type(inputs[1], "secret123");
    await user.click(screen.getByRole("button", { name: /Guardar contraseña/i }));
    expect(await screen.findByText(/Contraseña actualizada correctamente/i)).toBeInTheDocument();
  });

  it("muestra error si falla el cambio", async () => {
    server.use(http.put(`${API_BASE}/api/auth/cambiarContraseña`, () => HttpResponse.text("Error", { status: 500 })));
    const user = userEvent.setup();
    const { container } = renderWithProviders(<ChangePasswordPage />, { authenticated: true, route: "/perfil/cambiar-contrasena" });
    const inputs = container.querySelectorAll("input");
    await user.type(inputs[0], "secret123");
    await user.type(inputs[1], "secret123");
    await user.click(screen.getByRole("button", { name: /Guardar contraseña/i }));
    expect(await screen.findByText(/Error|No fue posible cambiar/i)).toBeInTheDocument();
  });
});
