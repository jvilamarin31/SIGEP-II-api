import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, waitFor, getFormControlByLabelText } from "../../test/testUtils";
import FileUploadField from "./FileUploadField";
import { server } from "../../test/server";
import { API_BASE, storeAuthenticatedUser } from "../../test/mocks";

describe("FileUploadField", () => {
  it("sube archivo válido, muestra documento, permite verlo y quitarlo", async () => {
    storeAuthenticatedUser();
    const onChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = renderWithProviders(<FileUploadField label="Soporte" value="" onChange={onChange} />, { authenticated: true });
    await user.upload(getFormControlByLabelText(/Soporte/i), new File(["pdf"], "documento.pdf", { type: "application/pdf" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("/api/archivos/mock-documento.pdf"));

    rerender(<FileUploadField label="Soporte" value="/api/archivos/mock-documento.pdf" onChange={onChange} />);
    expect(screen.getByText("Documento cargado")).toBeInTheDocument();
    await user.click(screen.getByText("Ver documento"));
    expect(window.open).toHaveBeenCalled();
    await user.click(screen.getByText("Quitar"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("rechaza documentos muy grandes y muestra errores de carga", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<FileUploadField label="Documento" value="" onChange={onChange} />, { authenticated: true });
    const huge = new File([new Uint8Array(11 * 1024 * 1024)], "grande.pdf", { type: "application/pdf" });
    await user.upload(getFormControlByLabelText(/Documento/i), huge);
    expect(await screen.findByText(/no puede superar 10 MB/i)).toBeInTheDocument();

    server.use(http.post(`${API_BASE}/api/archivos`, () => HttpResponse.text("error", { status: 500 })));
    await user.upload(getFormControlByLabelText(/Documento/i), new File(["pdf"], "doc.pdf", { type: "application/pdf" }));
    expect(await screen.findByText(/error|No fue posible/i)).toBeInTheDocument();
  });
});
