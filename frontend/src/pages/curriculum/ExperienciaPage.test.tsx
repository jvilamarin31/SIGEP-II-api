import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, waitFor } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import ExperienciaPage from "./ExperienciaPage";

describe("ExperienciaPage", () => {
  it("carga experiencia laboral y docente, permite agregar y guardar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExperienciaPage />, { authenticated: true, route: "/curriculum/experiencia" });

    expect(await screen.findByDisplayValue("Alcaldía Municipal")).toBeInTheDocument();
    expect(screen.getByText(/Empleo #1/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Guardar sección/i }));
    expect(await screen.findByText(/Experiencia laboral guardada correctamente/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Agregar otra experiencia/i }));
    expect(screen.getByText(/Empleo #2/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Docente/i }));
    expect(screen.getByDisplayValue("Universidad del Cauca")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Agregar experiencia docente/i }));
    expect(screen.getByText(/Docencia #2/i)).toBeInTheDocument();
  });

  it("muestra errores amables al guardar experiencia", async () => {
    server.use(http.put(`${API_BASE}/api/curriculum/experienciaLaboral`, () => HttpResponse.text("backend exception", { status: 500 })));
    const user = userEvent.setup();
    renderWithProviders(<ExperienciaPage />, { authenticated: true, route: "/curriculum/experiencia" });
    expect(await screen.findByDisplayValue("Alcaldía Municipal")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Guardar sección/i }));
    await waitFor(() => expect(screen.getByText(/backend exception|No fue posible/i)).toBeInTheDocument());
  });
});
