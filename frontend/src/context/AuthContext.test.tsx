import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";
import { loginResponse, makeJwt, STORAGE_KEY, storeAuthenticatedUser } from "../test/mocks";
import { RolUsuario } from "../types";

const Probe = () => {
  const { user, isAuthenticated, login, logout, hasRole } = useAuth();
  return (
    <div>
      <div data-testid="auth">{String(isAuthenticated)}</div>
      <div data-testid="role-ok">{String(hasRole([RolUsuario.ServidorPublico]))}</div>
      <div data-testid="id">{user?.id ?? "none"}</div>
      <button onClick={() => login(loginResponse)}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe("AuthProvider", () => {
  it("inicia sesión, guarda usuario y cierra sesión", async () => {
    const user = userEvent.setup();
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId("auth")).toHaveTextContent("false");

    await user.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("true"));
    expect(screen.getByTestId("role-ok")).toHaveTextContent("true");
    expect(screen.getByTestId("id")).toHaveTextContent("user-1");
    expect(localStorage.getItem(STORAGE_KEY)).toContain("1107843949");

    await user.click(screen.getByText("logout"));
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("false"));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("recupera usuario válido y elimina usuario vencido o corrupto", () => {
    storeAuthenticatedUser();
    const { unmount } = render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId("auth")).toHaveTextContent("true");
    unmount();

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loginResponse, token: makeJwt({ exp: 1 }) }));
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    localStorage.setItem(STORAGE_KEY, "not-json");
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
