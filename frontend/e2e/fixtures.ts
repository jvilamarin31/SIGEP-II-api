import { test as base, expect } from "@playwright/test";

const makeJwt = (payload: Record<string, unknown> = {}) => {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    sub: "user-1",
    rol: "jefeDeTalentoHumano",
    numeroIdentificacion: "1107843949",
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    ...payload,
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode(header)}.${encode(body)}.signature`;
};

export const test = base.extend({
  page: async ({ page }, runFixture) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ tipoIdentificacion: "CedulaDeCiudadania", numeroIdentificacion: "1107843949", token: makeJwt() }),
      });
    });

    await page.route("**/api/auth/**", async (route) => {
      await route.fulfill({ status: 200, contentType: "text/plain", body: "Operación realizada correctamente." });
    });

    await page.route("**/api/archivos", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: "/api/archivos/documento.pdf" }) });
    });

    await page.route("**/api/curriculum/datosPersonales/datosBasicos", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ nombre: "Ana Pérez", tipoIdentificacion: "CedulaDeCiudadania", numeroIdentificacion: "1107843949", fechaNacimiento: "1990-01-01T00:00:00.000Z", email: "ana@example.com", genero: "FEMENINO", documentoVerificado: true, libretaVerificada: false, personaExpuestaPoliticamente: false }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.route("**/api/curriculum/datosPersonales/datosDemograficos", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ nacionalidad: "Colombiana", estadoCivil: "SOLTERO", preferenciaEtnica: "NINGUNA", paisNacimiento: "Colombia", departamentoNacimiento: "Cauca", municipioNacimiento: "Popayán", discapacidad: false }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.route("**/api/curriculum/datosPersonales/datosContacto", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ paisResidencia: "Colombia", departamentoResidencia: "Cauca", municipioResidencia: "Santander", direccionResidencia: "Calle 1", zona: "URBANA", celular: "3000000000", emailPersonalPrincipal: "ana.personal@example.com" }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    const list = [{ id: "1", nombre: "Registro", idioma: "Inglés", institucion: "Universidad", nombreEntidadEmpresa: "Alcaldía", nombrePublicacion: "Publicación" }];
    await page.route("**/api/curriculum/educacion/**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: route.request().method() === "GET" ? JSON.stringify(list) : "{}" }));
    await page.route("**/api/curriculum/experienciaLaboral**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: route.request().method() === "GET" ? JSON.stringify(list) : "{}" }));
    await page.route("**/api/curriculum/gerenciaPublica/**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: route.request().method() === "GET" ? JSON.stringify(list) : "{}" }));

    await runFixture(page);
  },
});

export { expect };
