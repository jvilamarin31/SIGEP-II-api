import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, waitFor, getFormControlByLabelText } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import GerenciaPublicaPage from "./GerenciaPublicaPage";

const fillPublicacion = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(getFormControlByLabelText(/Nombre artículo/i), "Nuevo artículo");
  await user.type(getFormControlByLabelText(/Libro \/ revista/i), "Revista pública");
  await user.type(getFormControlByLabelText(/Nombre publicación/i), "Publicación nueva");
};

describe("GerenciaPublicaPage", () => {
  it("lista registros existentes y crea registros en cada pestaña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GerenciaPublicaPage />, { authenticated: true, route: "/curriculum/gerencia-publica" });

    expect(await screen.findByText(/Artículo de gestión pública/i)).toBeInTheDocument();
    await fillPublicacion(user);
    await user.click(screen.getByRole("button", { name: /Crear registro/i }));
    expect(await screen.findByText(/Información guardada correctamente/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(await screen.findByText(/Reconocimiento institucional/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(await screen.findByText(/Proyecto de modernización/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(await screen.findByText(/Consejo profesional/i)).toBeInTheDocument();
  });

  it("muestra errores amables al crear registros", async () => {
    server.use(http.post(`${API_BASE}/api/curriculum/gerenciaPublica/publicacion`, () => HttpResponse.text("backend exception", { status: 500 })));
    const user = userEvent.setup();
    renderWithProviders(<GerenciaPublicaPage />, { authenticated: true, route: "/curriculum/gerencia-publica" });
    await screen.findByRole("heading", { name: /Gerencia Pública/i });
    await fillPublicacion(user);
    await user.click(screen.getByRole("button", { name: /Crear registro/i }));
    await waitFor(() => expect(screen.getByText(/No fue posible/i)).toBeInTheDocument());
  });
});
