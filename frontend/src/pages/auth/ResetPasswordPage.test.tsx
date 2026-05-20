import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { cleanup, renderWithProviders, screen, userEvent, getFormControlByLabelText } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import ResetPasswordPage from "./ResetPasswordPage";

describe("ResetPasswordPage", () => {
  it("deshabilita sin token y valida contraseña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, { route: "/recuperar-contrasena" });
    expect(screen.getByRole("heading", { name: /Nueva contraseña/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cambiar contraseña/i })).toBeDisabled();

    renderWithProviders(<ResetPasswordPage />, { route: "/recuperar-contrasena?token=abc" });
    await user.type(getFormControlByLabelText(/^Nueva contraseña/i), "123");
    await user.type(getFormControlByLabelText(/Confirmar contraseña/i), "123");
    await user.click(screen.getAllByRole("button", { name: /Cambiar contraseña/i }).at(-1)!);
    expect(await screen.findByText(/mínimo 6/i)).toBeInTheDocument();
  });

  it("cambia contraseña con token y maneja errores", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, { route: "/recuperar-contrasena?token=abc" });
    await user.type(getFormControlByLabelText(/^Nueva contraseña/i), "secret123");
    await user.type(getFormControlByLabelText(/Confirmar contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /Cambiar contraseña/i }));
    expect(await screen.findByText(/Contraseña actualizada/i)).toBeInTheDocument();

    cleanup();
    server.use(http.post(`${API_BASE}/api/auth/recuperarContraseña`, () => HttpResponse.text("Error", { status: 500 })));
    renderWithProviders(<ResetPasswordPage />, { route: "/recuperar-contrasena?token=abc" });
    await user.type(getFormControlByLabelText(/^Nueva contraseña/i), "secret123");
    await user.type(getFormControlByLabelText(/Confirmar contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /Cambiar contraseña/i }));
    expect(await screen.findByText(/Error|No fue posible cambiar/i)).toBeInTheDocument();
  });
});
