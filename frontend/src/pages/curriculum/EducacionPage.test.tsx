import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { getFormControlByLabelText, renderWithProviders, screen, userEvent, waitFor } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import EducacionPage from "./EducacionPage";

describe("EducacionPage", () => {
  it("carga registros existentes, agrega nuevos formularios y guarda sección", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EducacionPage />, { authenticated: true, route: "/curriculum/educacion" });

    expect(await screen.findByDisplayValue("Universidad Nacional de Colombia")).toBeInTheDocument();
    expect(screen.getByText(/Estudio #1/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Guardar sección/i }));
    expect(await screen.findByText(/Información de educación guardada correctamente/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Agregar otra formación/i }));
    expect(screen.getByText(/Estudio #2/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Idiomas/i }));
    expect(screen.getByDisplayValue("Inglés")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Agregar idioma/i }));
    expect(screen.getByText(/Idioma #2/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Educación para el trabajo/i }));
    expect(screen.getByDisplayValue("Curso de Gestión Pública")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Agregar educación para el trabajo/i }));
    expect(screen.getByText(/Capacitación #2/i)).toBeInTheDocument();
  });

  it("muestra estado vacío y errores de guardado", async () => {
    server.use(
      http.get(`${API_BASE}/api/curriculum/educacion/formacionAcademica`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/educacion/idioma`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/educacion/trabajo`, () => HttpResponse.json([])),
      http.post(`${API_BASE}/api/curriculum/educacion/formacionAcademica`, () => HttpResponse.text("backend exception", { status: 500 }))
    );
    const user = userEvent.setup();
    renderWithProviders(<EducacionPage />, { authenticated: true, route: "/curriculum/educacion" });
    expect(await screen.findByText(/Estudio #1/i)).toBeInTheDocument();
    await user.type(getFormControlByLabelText(/^Institución/i), "Universidad de Prueba");
    await user.type(getFormControlByLabelText(/Título obtenido/i), "Título de Prueba");
    await user.click(screen.getByRole("button", { name: /Guardar sección/i }));
    await waitFor(() => expect(screen.getByText(/backend exception|No fue posible/i)).toBeInTheDocument());
  });
});
