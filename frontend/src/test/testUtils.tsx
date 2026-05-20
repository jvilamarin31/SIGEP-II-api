import React from "react";
import { render, screen, type RenderOptions, type Matcher } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { storeAuthenticatedUser } from "./mocks";

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions & { route?: string; authenticated?: boolean; admin?: boolean }
) => {
  if (options?.authenticated) {
    storeAuthenticatedUser(options.admin ? { rol: "jefeDeTalentoHumano" } : {});
  }

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[options?.route ?? "/"]}>{ui}</MemoryRouter>
    </AuthProvider>,
    options
  );
};

export const renderRoute = (
  element: React.ReactElement,
  path = "/",
  route = "/",
  authenticated = true
) => {
  if (authenticated) storeAuthenticatedUser();

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={element} />
          <Route path="/login" element={<div>Login redirect</div>} />
          <Route path="/dashboard" element={<div>Dashboard redirect</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

export const getFormControlByLabelText = (matcher: Matcher): HTMLElement => {
  try {
    return screen.getByLabelText(matcher) as HTMLElement;
  } catch {
    const labels = screen.getAllByText(matcher, { selector: "label" });

    for (const label of labels) {
      const group = label.closest(".form-group") ?? label.parentElement;
      const control = group?.querySelector("input, select, textarea") as HTMLElement | null;
      if (control) return control;
    }

    throw new Error(`No form control found for label ${String(matcher)}`);
  }
};

export { screen, waitFor, fireEvent, within, act, cleanup } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
