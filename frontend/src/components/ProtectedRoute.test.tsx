import { describe, expect, it } from "vitest";
import { Routes, Route } from "react-router-dom";
import { screen } from "../test/testUtils";
import { renderWithProviders } from "../test/testUtils";
import ProtectedRoute from "./ProtectedRoute";
import { RolUsuario } from "../types";

const Routed = ({ adminOnly = false }) => (
  <Routes>
    <Route path="/secret" element={<ProtectedRoute allowedRoles={adminOnly ? [RolUsuario.JefeDeTalentoHumano] : undefined}><div>Contenido protegido</div></ProtectedRoute>} />
    <Route path="/login" element={<div>Login redirect</div>} />
    <Route path="/dashboard" element={<div>Dashboard redirect</div>} />
  </Routes>
);

describe("ProtectedRoute", () => {
  it("redirige si no hay sesión", () => {
    renderWithProviders(<Routed />, { route: "/secret" });
    expect(screen.getByText("Login redirect")).toBeInTheDocument();
  });

  it("permite sesión válida y bloquea rol insuficiente", () => {
    renderWithProviders(<Routed />, { route: "/secret", authenticated: true });
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();

    renderWithProviders(<Routed adminOnly />, { route: "/secret", authenticated: true });
    expect(screen.getByText("Dashboard redirect")).toBeInTheDocument();
  });
});
