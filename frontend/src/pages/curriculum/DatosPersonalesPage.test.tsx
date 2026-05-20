import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, waitFor, getFormControlByLabelText } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import DatosPersonalesPage from "./DatosPersonalesPage";

describe("DatosPersonalesPage", () => {
  it("carga datos existentes y permite actualizar cada pestaña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DatosPersonalesPage />, { authenticated: true, route: "/curriculum/datos-personales" });

    expect(await screen.findByDisplayValue("Ana Pérez")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Actualizar \/ guardar|Crear datos básicos/i }));
    expect(await screen.findByText(/Información guardada correctamente/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Demográficos/i }));
    expect(screen.getByDisplayValue("Colombiana")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Actualizar \/ guardar|Crear datos básicos/i }));
    expect(await screen.findByText(/Información guardada correctamente/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Contacto/i }));
    expect(screen.getByDisplayValue("Santander de Quilichao")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Actualizar \/ guardar|Crear datos básicos/i }));
    expect(await screen.findByText(/Información guardada correctamente/i)).toBeInTheDocument();
  });

  it("crea datos nuevos cuando no existen y muestra errores amables", async () => {
    server.use(
      http.get(`${API_BASE}/api/curriculum/datosPersonales/datosBasicos`, () => HttpResponse.text("No encontrado", { status: 404 })),
      http.get(`${API_BASE}/api/curriculum/datosPersonales/datosDemograficos`, () => HttpResponse.text("No encontrado", { status: 404 })),
      http.get(`${API_BASE}/api/curriculum/datosPersonales/datosContacto`, () => HttpResponse.text("No encontrado", { status: 404 }))
    );
    const user = userEvent.setup();
    renderWithProviders(<DatosPersonalesPage />, { authenticated: true, route: "/curriculum/datos-personales" });
    await waitFor(() => expect(screen.getByRole("heading", { name: /Datos Personales/i })).toBeInTheDocument());
    await user.type(getFormControlByLabelText(/Nombre completo/i), "Ana Pérez");
    await user.type(getFormControlByLabelText(/^Número de identificación/i), "1107843949");
    await user.type(getFormControlByLabelText(/Fecha de nacimiento/i), "1990-01-01");
    await user.type(getFormControlByLabelText(/Correo electrónico institucional/i), "ana@example.com");
    await user.click(screen.getByRole("button", { name: /Actualizar \/ guardar|Crear datos básicos/i }));
    expect(await screen.findByText(/Información guardada correctamente/i)).toBeInTheDocument();

    server.use(
      http.post(`${API_BASE}/api/curriculum/datosPersonales/datosBasicos`, () => HttpResponse.text("backend stack", { status: 500 })),
      http.put(`${API_BASE}/api/curriculum/datosPersonales/datosBasicos`, () => HttpResponse.text("backend stack", { status: 500 }))
    );
    await user.click(screen.getByRole("button", { name: /Actualizar \/ guardar|Crear datos básicos/i }));
    expect(await screen.findByText(/backend stack|No fue posible/i)).toBeInTheDocument();
  });
});
