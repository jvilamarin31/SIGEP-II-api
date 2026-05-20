import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import DisableUserPage from "./DisableUserPage";

const typeName = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement, name: string, value: string) => {
  const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
  await user.type(input, value);
};

describe("DisableUserPage", () => {
  it("valida e inhabilita usuario", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<DisableUserPage />, { authenticated: true, admin: true, route: "/usuarios/inhabilitar" });
    await user.click(screen.getByRole("button", { name: /Inhabilitar usuario/i }));
    expect(screen.getByText(/Complete todos/i)).toBeInTheDocument();

    await typeName(user, container, "numeroIdentificacion", "123");
    await typeName(user, container, "fechaFin", "2026-12-31T08:00");
    await user.click(screen.getByRole("button", { name: /Inhabilitar usuario/i }));
    expect(await screen.findByText(/Usuario inhabilitado correctamente/i)).toBeInTheDocument();
  });

  it("muestra error si falla inhabilitación", async () => {
    server.use(http.put(`${API_BASE}/api/auth/inhabilitarUsuario`, () => HttpResponse.text("Error", { status: 500 })));
    const user = userEvent.setup();
    const { container } = renderWithProviders(<DisableUserPage />, { authenticated: true, admin: true, route: "/usuarios/inhabilitar" });
    await typeName(user, container, "numeroIdentificacion", "123");
    await typeName(user, container, "fechaFin", "2026-12-31T08:00");
    await user.click(screen.getByRole("button", { name: /Inhabilitar usuario/i }));
    expect(await screen.findByText(/No fue posible inhabilitar/i)).toBeInTheDocument();
  });
});
