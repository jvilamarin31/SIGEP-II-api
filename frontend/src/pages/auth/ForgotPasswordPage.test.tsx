import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, getFormControlByLabelText } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import ForgotPasswordPage from "./ForgotPasswordPage";

describe("ForgotPasswordPage", () => {
  it("valida número de identificación y solicita enlace", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, { route: "/recuperar" });
    expect(screen.getByRole("heading", { name: /Recuperar contraseña/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Enviar enlace/i }));
    expect(screen.getByText(/Ingrese el número/i)).toBeInTheDocument();

    await user.type(getFormControlByLabelText(/Número de identificación/i), "1107843949");
    await user.click(screen.getByRole("button", { name: /Enviar enlace/i }));
    expect(await screen.findByText(/Revise su correo/i)).toBeInTheDocument();
  });

  it("muestra error si no se puede enviar el enlace", async () => {
    server.use(http.post(`${API_BASE}/api/auth/pedirEnlace`, () => HttpResponse.text("Error", { status: 500 })));
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, { route: "/recuperar" });
    await user.type(getFormControlByLabelText(/Número de identificación/i), "1107843949");
    await user.click(screen.getByRole("button", { name: /Enviar enlace/i }));
    expect(await screen.findByText(/No fue posible enviar/i)).toBeInTheDocument();
  });
});
