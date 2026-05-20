import { describe, expect, it, vi } from "vitest";

describe("main", () => {
  it("monta la aplicación en #root", async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    const render = vi.fn();
    const createRoot = vi.fn(() => ({ render }));
    vi.doMock("react-dom/client", () => ({
      default: { createRoot },
      createRoot,
    }));
    await import("./main");
    expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(render).toHaveBeenCalled();
  });
});
