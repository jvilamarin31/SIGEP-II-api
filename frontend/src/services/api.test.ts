import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { authService, curriculumService, fileService, getApiError, removeEmpty, toInstant } from "./api";
import { server } from "../test/server";
import { API_BASE, storeAuthenticatedUser } from "../test/mocks";

const requiredAuth = () => storeAuthenticatedUser();

describe("servicios de API", () => {
  it("convierte fechas, limpia valores vacíos y traduce errores técnicos", async () => {
    expect(toInstant("2026-05-20")).toBe("2026-05-20T00:00:00.000Z");
    expect(toInstant()).toBeUndefined();
    expect(removeEmpty({ a: "x", b: "", c: null, d: undefined, e: 0 })).toEqual({ a: "x", e: 0 });

    server.use(http.get(`${API_BASE}/api/curriculum/datosPersonales/datosBasicos`, () => HttpResponse.text("backend exception stack", { status: 500 })));
    try {
      requiredAuth();
      await curriculumService.obtenerDatosBasicos();
    } catch (error) {
      expect(getApiError(error)).toBe("No fue posible completar la acción. Inténtalo nuevamente o vuelve a iniciar sesión.");
    }
  });

  it("ejecuta los métodos públicos de autenticación", async () => {
    await expect(authService.login({ tipoIdentificacion: "CedulaDeCiudadania", numeroIdentificacion: "1107843949", contraseña: "secret123" })).resolves.toHaveProperty("token");
    await expect(authService.pedirEnlace({ tipoIdentificacion: "CedulaDeCiudadania", numeroIdentificacion: "1107843949" })).resolves.toContain("correo");
    await expect(authService.recuperarContrasena("token", { contraseña: "secret123" })).resolves.toContain("Contraseña");
  });

  it("ejecuta los métodos privados de usuario con token", async () => {
    requiredAuth();
    await expect(authService.cambiarContraseña({ contraseña: "secret123" })).resolves.toBeTruthy();
    await expect(authService.crearUsuario({ tipoIdentificacion: "CedulaDeCiudadania", numeroIdentificacion: "1", email: "a@b.com", contraseña: "secret123" })).resolves.toBeTruthy();
    await expect(authService.inhabilitarUsuario({ tipoIdentificacion: "CedulaDeCiudadania", numeroIdentificacion: "1", fechaFinal: "2026-12-31T00:00:00.000Z" })).resolves.toBeTruthy();
  });

  it("ejecuta todos los métodos de curriculum y archivos", async () => {
    requiredAuth();
    await expect(curriculumService.obtenerDatosBasicos()).resolves.toHaveProperty("nombre");
    await expect(curriculumService.obtenerDatosDemograficos()).resolves.toHaveProperty("nacionalidad");
    await expect(curriculumService.obtenerDatosContacto()).resolves.toHaveProperty("direccionResidencia");
    await expect(curriculumService.registrarDatosBasicos({ nombre: "Ana", tipoIdentificacion: "CedulaDeCiudadania", numeroIdentificacion: "1", fechaNacimiento: "1990-01-01T00:00:00.000Z", email: "a@b.com", genero: "FEMENINO", documentoVerificado: false, libretaVerificada: false, personaExpuestaPoliticamente: false })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarDatosBasicos({ documentoIdentificacion: "" })).resolves.toBeTruthy();
    await expect(curriculumService.registrarDatosDemograficos({ nacionalidad: "Colombiana", estadoCivil: "SOLTERO", preferenciaEtnica: "NINGUNA", paisNacimiento: "Colombia", departamentoNacimiento: "Cauca", municipioNacimiento: "Popayán", discapacidad: false })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarDatosDemograficos({ discapacidad: true })).resolves.toBeTruthy();
    await expect(curriculumService.registrarDatosContacto({ paisResidencia: "Colombia", departamentoResidencia: "Cauca", municipioResidencia: "Popayán", direccionResidencia: "Calle", zona: "URBANA", telefonoCelular: "300" })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarDatosContacto({ telefonoCelular: "301" })).resolves.toBeTruthy();

    await expect(curriculumService.obtenerFormacionesAcademicas()).resolves.toHaveLength(1);
    await expect(curriculumService.obtenerEducacionesTrabajo()).resolves.toHaveLength(1);
    await expect(curriculumService.obtenerIdiomas()).resolves.toHaveLength(1);
    await expect(curriculumService.registrarFormacionAcademica({ nivelAcademico: "PREGRADO", nivelFormacion: "PROFESIONAL", areaConocimiento: "NO_APLICA", pais: "Colombia", institucion: "U", estadoEstudio: "Finalizado", tituloObtenido: "T" })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarFormacionAcademica({ formacionId: "formacion-1", tituloObtenido: "T2" })).resolves.toBeTruthy();
    await expect(curriculumService.registrarEducacionTrabajo({ fechaFinalizacion: "2024-01-01T00:00:00.000Z", numeroTotalHoras: 40, pais: "Colombia", nombre: "Curso", institucion: "ESAP", medioCapacitacion: "VIRTUAL", modalidad: "EDUCACION_INFORMAL" })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarEducacionTrabajo({ educacionTrabajoId: "trabajo-1", numeroTotalHoras: 50 })).resolves.toBeTruthy();
    await expect(curriculumService.registrarIdioma({ idioma: "Inglés", fechaCertificado: "2024-01-01T00:00:00.000Z", conversacion: "BIEN", lectura: "BIEN", redaccion: "BIEN", lenguaNativa: false })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarIdioma({ idiomaId: "idioma-1", lectura: "MUY_BIEN" })).resolves.toBeTruthy();

    await expect(curriculumService.obtenerExperienciasLaborales()).resolves.toHaveLength(1);
    await expect(curriculumService.obtenerExperienciasDocentes()).resolves.toHaveLength(1);
    await expect(curriculumService.registrarExperienciaLaboral({ tipoEntidad: "PUBLICA", pais: "Colombia", departamento: "Cauca", municipio: "Popayán", nombreEntidadEmpresa: "Entidad", correoEntidadEmpresa: "a@b.com", telefonosEntidadEmpresa: "300", tipoZona: "URBANA", cargo: "Cargo", dependencia: "Dep", direccion: "Dir", fechaIngreso: "2024-01-01T00:00:00.000Z", trabajoActual: true, tiempoExperiencia: 1, jornadaLaboral: "TIEMPO_COMPLETO", nivelJerarquicoEmpleo: "PROFESIONAL" })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarExperienciaLaboral({ experienciaLaboralId: "exp-1", telefonosEntidadEmpresa: "301" })).resolves.toBeTruthy();
    await expect(curriculumService.registrarExperienciaLaboralDocente({ institucion: "U", tipoInstitucion: "PUBLICA", pais: "Colombia", departamento: "Cauca", municipio: "Popayán", fechaIngreso: "2024-01-01T00:00:00.000Z", horasPromedioMes: 10, trabajoActual: true })).resolves.toBeTruthy();
    await expect(curriculumService.actualizarExperienciaLaboralDocente({ experienciaLaboralDocenteId: "doc-1", horasPromedioMes: 12 })).resolves.toBeTruthy();

    await expect(curriculumService.obtenerPublicaciones()).resolves.toHaveLength(1);
    await expect(curriculumService.obtenerPremiosReconocimientos()).resolves.toHaveLength(1);
    await expect(curriculumService.obtenerParticipacionesProyectos()).resolves.toHaveLength(1);
    await expect(curriculumService.obtenerParticipacionesCorporaciones()).resolves.toHaveLength(1);
    await expect(curriculumService.registrarPublicacion({ titulo: "T", tipoProduccionBibliografica: "OTRO" })).resolves.toBeTruthy();
    await expect(curriculumService.registrarPremioReconocimiento({ tipo: "Premio", nombre: "P", descripcion: "D", nombreEntidadOrganizacion: "E", fecha: "2024-01-01", pais: "Colombia", departamento: "Cauca", municipio: "Popayán" })).resolves.toBeTruthy();
    await expect(curriculumService.registrarParticipacionProyecto({ nombre: "P", rolDesempeñado: "Líder", nombreEntidadOrganizacion: "E", pais: "Colombia", departamento: "Cauca", municipio: "Popayán", fechaInicio: "2024-01-01", fechaTerminacion: "2024-02-01" })).resolves.toBeTruthy();
    await expect(curriculumService.registrarParticipacionCorporacionEntidad({ nombreCorporacion: "C", nombreRazonSocialInstitucion: "R", nombreEntidadOrganizacion: "E" })).resolves.toBeTruthy();

    const file = new File(["pdf"], "doc.pdf", { type: "application/pdf" });
    await expect(fileService.subirArchivo(file)).resolves.toHaveProperty("url");
    await expect(fileService.verArchivo("/api/archivos/doc.pdf")).resolves.toBeUndefined();
  });
});
