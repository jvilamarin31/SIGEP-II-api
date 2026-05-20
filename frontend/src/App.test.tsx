import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { storeAuthenticatedUser } from "./test/mocks";
import { RolUsuario } from "./types";

const renderPath = (path: string, auth = false, admin = false) => {
  window.history.pushState({}, "", path);
  if (auth) storeAuthenticatedUser(admin ? { rol: RolUsuario.JefeDeTalentoHumano } : {});
  return render(<App />);
};

describe("App routing", () => {
  it("redirige raíz y rutas inexistentes a login", () => {
    renderPath("/");
    expect(screen.getByRole("heading", { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it("renderiza rutas públicas", () => {
    renderPath("/recuperar");
    expect(screen.getByRole("heading", { name: /Recuperar contraseña/i })).toBeInTheDocument();

    renderPath("/recuperar-contrasena?token=abc");
    expect(screen.getAllByRole("heading", { name: /Nueva contraseña/i }).at(-1)).toBeInTheDocument();
  });

  it("protege rutas privadas y permite acceso autenticado", async () => {
    renderPath("/dashboard", true);
    expect(await screen.findByText(/Secciones de la Hoja de Vida/i)).toBeInTheDocument();
  });

  it("protege rutas administrativas por rol", async () => {
    renderPath("/usuarios/crear", true, false);
    expect(await screen.findByText(/Secciones de la Hoja de Vida/i)).toBeInTheDocument();

    renderPath("/usuarios/crear", true, true);
    expect(await screen.findByRole("heading", { name: /Crear usuario/i })).toBeInTheDocument();
  });
});
