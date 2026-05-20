import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders, screen, userEvent, waitFor, getFormControlByLabelText } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import LoginPage from "./LoginPage";

const LoginRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={<div>Dashboard listo</div>} />
    <Route path="/recuperar" element={<div>Recuperar ruta</div>} />
  </Routes>
);

describe("LoginPage", () => {
  it("renderiza, valida campos y navega al dashboard al iniciar sesión", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginRoutes />, { route: "/login" });

    expect(screen.getByRole("heading", { name: /Iniciar sesión/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(screen.getByText(/Todos los campos/i)).toBeInTheDocument();

    await user.type(getFormControlByLabelText(/Número de identificación/i), "1107843949");
    await user.type(getFormControlByLabelText(/Contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(await screen.findByText("Dashboard listo")).toBeInTheDocument();
    expect(localStorage.getItem("sigep_user")).toContain("1107843949");
  });

  it("muestra error amable cuando las credenciales fallan", async () => {
    server.use(http.post(`${API_BASE}/api/auth/login`, () => HttpResponse.text("Credenciales inválidas", { status: 401 })));
    const user = userEvent.setup();
    renderWithProviders(<LoginRoutes />, { route: "/login" });
    await user.type(getFormControlByLabelText(/Número de identificación/i), "1");
    await user.type(getFormControlByLabelText(/Contraseña/i), "wrong");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    await waitFor(() => expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument());
  });
});
