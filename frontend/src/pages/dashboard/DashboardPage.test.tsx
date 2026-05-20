import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, waitFor } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import DashboardPage from "./DashboardPage";

describe("DashboardPage", () => {
  it("muestra progreso real de secciones y permite navegar por tarjetas", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { authenticated: true, route: "/dashboard" });

    expect(screen.getAllByRole("heading", { name: /Hoja de Vida/i }).length).toBeGreaterThan(0);
    expect(await screen.findByText("4 / 4")).toBeInTheDocument();
    expect(screen.getAllByText("Completo")).toHaveLength(4);
    await user.click(screen.getByText("Datos Personales"));
  });

  it("marca secciones incompletas cuando no hay datos", async () => {
    server.use(
      http.get(`${API_BASE}/api/curriculum/educacion/formacionAcademica`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/educacion/trabajo`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/educacion/idioma`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/experienciaLaboral`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/experienciaLaboral/docente`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/gerenciaPublica/publicacion`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/gerenciaPublica/premioReconocimiento`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/gerenciaPublica/participacionProyecto`, () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/curriculum/gerenciaPublica/participacionCorporacionEntidad`, () => HttpResponse.json([]))
    );
    renderWithProviders(<DashboardPage />, { authenticated: true, route: "/dashboard" });
    await waitFor(() => expect(screen.getByText("1 / 4")).toBeInTheDocument());
    expect(screen.getAllByText("Incompleto").length).toBeGreaterThanOrEqual(3);
  });
});
