import { http, HttpResponse } from "msw";
import {
  API_BASE,
  corporacion,
  datosBasicos,
  datosContacto,
  datosDemograficos,
  educacionTrabajo,
  experienciaDocente,
  experienciaLaboral,
  formacionAcademica,
  idioma,
  loginResponse,
  premio,
  proyecto,
  publicacion,
} from "./mocks";

const okText = (message = "Operación realizada correctamente.") => HttpResponse.text(message, { status: 200 });

export const handlers = [
  http.post(`${API_BASE}/api/auth/login`, () => HttpResponse.json(loginResponse)),
  http.post(`${API_BASE}/api/auth/pedirEnlace`, () => okText("Revise su correo electrónico.")),
  http.post(`${API_BASE}/api/auth/recuperarContraseña`, () => okText("Contraseña actualizada correctamente.")),
  http.post(`${API_BASE}/api/auth/recuperarContrase%C3%B1a`, () => okText("Contraseña actualizada correctamente.")),
  http.put(`${API_BASE}/api/auth/cambiarContraseña`, () => okText("Contraseña actualizada correctamente.")),
  http.put(`${API_BASE}/api/auth/cambiarContrase%C3%B1a`, () => okText("Contraseña actualizada correctamente.")),
  http.post(`${API_BASE}/api/auth/registro`, () => okText("Usuario creado correctamente.")),
  http.put(`${API_BASE}/api/auth/inhabilitarUsuario`, () => okText("Usuario inhabilitado correctamente.")),

  http.post(`${API_BASE}/api/archivos`, () => HttpResponse.json({ url: "/api/archivos/mock-documento.pdf" })),
  http.get(`${API_BASE}/api/archivos/:archivo`, () => new HttpResponse(new Blob(["pdf"], { type: "application/pdf" }))),

  http.get(`${API_BASE}/api/curriculum/datosPersonales/datosBasicos`, () => HttpResponse.json(datosBasicos)),
  http.post(`${API_BASE}/api/curriculum/datosPersonales/datosBasicos`, async ({ request }) => HttpResponse.json({ ...datosBasicos, ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/datosPersonales/datosBasicos`, async ({ request }) => HttpResponse.json({ ...datosBasicos, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/datosPersonales/datosDemograficos`, () => HttpResponse.json(datosDemograficos)),
  http.post(`${API_BASE}/api/curriculum/datosPersonales/datosDemograficos`, async ({ request }) => HttpResponse.json({ ...datosDemograficos, ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/datosPersonales/datosDemograficos`, async ({ request }) => HttpResponse.json({ ...datosDemograficos, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/datosPersonales/datosContacto`, () => HttpResponse.json(datosContacto)),
  http.post(`${API_BASE}/api/curriculum/datosPersonales/datosContacto`, async ({ request }) => HttpResponse.json({ ...datosContacto, ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/datosPersonales/datosContacto`, async ({ request }) => HttpResponse.json({ ...datosContacto, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/educacion/formacionAcademica`, () => HttpResponse.json([formacionAcademica])),
  http.post(`${API_BASE}/api/curriculum/educacion/formacionAcademica`, async ({ request }) => HttpResponse.json({ id: "formacion-nueva", ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/educacion/formacionAcademica`, async ({ request }) => HttpResponse.json({ ...formacionAcademica, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/educacion/idioma`, () => HttpResponse.json([idioma])),
  http.post(`${API_BASE}/api/curriculum/educacion/idioma`, async ({ request }) => HttpResponse.json({ id: "idioma-nuevo", ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/educacion/idioma`, async ({ request }) => HttpResponse.json({ ...idioma, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/educacion/trabajo`, () => HttpResponse.json([educacionTrabajo])),
  http.post(`${API_BASE}/api/curriculum/educacion/trabajo`, async ({ request }) => HttpResponse.json({ id: "trabajo-nuevo", ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/educacion/trabajo`, async ({ request }) => HttpResponse.json({ ...educacionTrabajo, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/experienciaLaboral`, () => HttpResponse.json([experienciaLaboral])),
  http.post(`${API_BASE}/api/curriculum/experienciaLaboral`, async ({ request }) => HttpResponse.json({ id: "exp-nueva", ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/experienciaLaboral`, async ({ request }) => HttpResponse.json({ ...experienciaLaboral, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/experienciaLaboral/docente`, () => HttpResponse.json([experienciaDocente])),
  http.post(`${API_BASE}/api/curriculum/experienciaLaboral/docente`, async ({ request }) => HttpResponse.json({ id: "doc-nueva", ...(await request.json() as object) })),
  http.put(`${API_BASE}/api/curriculum/experienciaLaboral/docente`, async ({ request }) => HttpResponse.json({ ...experienciaDocente, ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/gerenciaPublica/publicacion`, () => HttpResponse.json([publicacion])),
  http.post(`${API_BASE}/api/curriculum/gerenciaPublica/publicacion`, async ({ request }) => HttpResponse.json({ id: "pub-nueva", ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/gerenciaPublica/premioReconocimiento`, () => HttpResponse.json([premio])),
  http.post(`${API_BASE}/api/curriculum/gerenciaPublica/premioReconocimiento`, async ({ request }) => HttpResponse.json({ id: "premio-nuevo", ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/gerenciaPublica/participacionProyecto`, () => HttpResponse.json([proyecto])),
  http.post(`${API_BASE}/api/curriculum/gerenciaPublica/participacionProyecto`, async ({ request }) => HttpResponse.json({ id: "proyecto-nuevo", ...(await request.json() as object) })),

  http.get(`${API_BASE}/api/curriculum/gerenciaPublica/participacionCorporacionEntidad`, () => HttpResponse.json([corporacion])),
  http.post(`${API_BASE}/api/curriculum/gerenciaPublica/participacionCorporacionEntidad`, async ({ request }) => HttpResponse.json({ id: "corp-nueva", ...(await request.json() as object) })),


  http.all("*", () => okText("Operación realizada correctamente.")),
];
