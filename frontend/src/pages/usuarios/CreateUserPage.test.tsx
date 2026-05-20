import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent } from "../../test/testUtils";
import { server } from "../../test/server";
import { API_BASE } from "../../test/mocks";
import CreateUserPage from "./CreateUserPage";

const fillByName = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement, name: string, value: string) => {
  const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
  await user.clear(input);
  await user.type(input, value);
};

describe("CreateUserPage", () => {
  it("valida y crea usuario", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<CreateUserPage />, { authenticated: true, admin: true, route: "/usuarios/crear" });
    expect(screen.getByRole("heading", { name: /Crear usuario/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Crear usuario/i }));
    expect(screen.getByText(/Complete todos/i)).toBeInTheDocument();

    await fillByName(user, container, "numeroIdentificacion", "123");
    await fillByName(user, container, "email", "persona@example.com");
    await fillByName(user, container, "contraseña", "secret123");
    await fillByName(user, container, "confirmarContraseña", "secret123");
    await user.click(screen.getByRole("button", { name: /Crear usuario/i }));
    expect(await screen.findByText(/Usuario creado correctamente/i)).toBeInTheDocument();
  });

  it("muestra error si falla creación", async () => {
    server.use(http.post(`${API_BASE}/api/auth/registro`, () => HttpResponse.text("Error", { status: 500 })));
    const user = userEvent.setup();
    const { container } = renderWithProviders(<CreateUserPage />, { authenticated: true, admin: true, route: "/usuarios/crear" });
    await fillByName(user, container, "numeroIdentificacion", "123");
    await fillByName(user, container, "email", "persona@example.com");
    await fillByName(user, container, "contraseña", "secret123");
    await fillByName(user, container, "confirmarContraseña", "secret123");
    await user.click(screen.getByRole("button", { name: /Crear usuario/i }));
    expect(await screen.findByText(/No fue posible crear/i)).toBeInTheDocument();
  });
});
