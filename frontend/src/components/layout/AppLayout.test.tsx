import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "../../test/testUtils";
import AppLayout from "./AppLayout";
import { storeAuthenticatedUser } from "../../test/mocks";
import { RolUsuario } from "../../types";

const renderLayout = (admin = false) => {
  storeAuthenticatedUser(admin ? { rol: RolUsuario.JefeDeTalentoHumano } : {});
  return renderWithProviders(<AppLayout title="Título de prueba"><div>Contenido interno</div></AppLayout>, { route: "/dashboard" });
};

describe("AppLayout", () => {
  it("muestra navegación principal, datos del usuario y contenido", () => {
    renderLayout();
    expect(screen.getByText("SIGEP II")).toBeInTheDocument();
    expect(screen.getByText("Título de prueba")).toBeInTheDocument();
    expect(screen.getByText("Contenido interno")).toBeInTheDocument();
    expect(screen.getByText("Datos Personales")).toBeInTheDocument();
    expect(screen.getByText("Servidor Público")).toBeInTheDocument();
  });

  it("muestra opciones de Talento Humano solo para rol autorizado y permite cerrar sesión", async () => {
    const user = userEvent.setup();
    renderLayout(true);
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Crear usuario")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Salir/i }));
    expect(localStorage.getItem("sigep_user")).toBeNull();
  });
});
