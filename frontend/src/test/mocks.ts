import { RolUsuario, TipoIdentificacion } from "../types";

export const API_BASE = "http://localhost:8080";
export const STORAGE_KEY = "sigep_user";

export const makeJwt = (payload: Record<string, unknown> = {}) => {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    sub: "user-1",
    rol: RolUsuario.ServidorPublico,
    numeroIdentificacion: "1107843949",
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    ...payload,
  };
  const encode = (value: unknown) =>
    window.btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${encode(header)}.${encode(body)}.signature`;
};

export const loginResponse = {
  tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
  numeroIdentificacion: "1107843949",
  token: makeJwt(),
};

export const adminLoginResponse = {
  ...loginResponse,
  token: makeJwt({ rol: RolUsuario.JefeDeTalentoHumano }),
};

export const storeAuthenticatedUser = (overrides: Record<string, unknown> = {}) => {
  const token = String(overrides.token ?? makeJwt(overrides));
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...loginResponse,
      ...overrides,
      token,
    })
  );
};

export const datosBasicos = {
  nombre: "Ana Pérez",
  tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
  numeroIdentificacion: "1107843949",
  fechaNacimiento: "1990-01-01T00:00:00.000Z",
  email: "ana@example.com",
  genero: "FEMENINO",
  documentoIdentificacion: "/api/archivos/documento.pdf",
  documentoVerificado: true,
  libretaVerificada: false,
  personaExpuestaPoliticamente: false,
};

export const datosDemograficos = {
  nacionalidad: "Colombiana",
  estadoCivil: "SOLTERO",
  preferenciaEtnica: "NINGUNA",
  paisNacimiento: "Colombia",
  departamentoNacimiento: "Cauca",
  municipioNacimiento: "Popayán",
  discapacidad: false,
};

export const datosContacto = {
  paisResidencia: "Colombia",
  departamentoResidencia: "Cauca",
  municipioResidencia: "Santander de Quilichao",
  direccionResidencia: "Calle 1 # 2-3",
  zona: "URBANA",
  telefonoResidencia: "6020000000",
  telefonoCelular: "3000000000",
  celular: "3000000000",
  emailPersonal: "ana.personal@example.com",
  emailPersonalPrincipal: "ana.personal@example.com",
};

export const formacionAcademica = {
  id: "formacion-1",
  nivelAcademico: "PREGRADO",
  nivelFormacion: "PROFESIONAL",
  areaConocimiento: "NO_APLICA",
  pais: "Colombia",
  institucion: "Universidad Nacional de Colombia",
  institucionFormacionAcademica: "Universidad Nacional de Colombia",
  programaAcademico: "Ingeniería de Sistemas",
  tituloObtenido: "Ingeniera de Sistemas",
  semestresAprobados: 10,
  estadoEstudio: "Finalizado",
  fechaTerminacionMaterias: "2020-01-01T00:00:00.000Z",
  fechaGrado: "2020-06-01T00:00:00.000Z",
  estudioConvalidado: false,
  archivoEducacionFormal: "/api/archivos/diploma.pdf",
};

export const idioma = {
  id: "idioma-1",
  idioma: "Inglés",
  fechaCertificado: "2024-01-01T00:00:00.000Z",
  conversacion: "BIEN",
  lectura: "MUY_BIEN",
  redaccion: "BIEN",
  lenguaNativa: false,
  certificado: "/api/archivos/idioma.pdf",
};

export const educacionTrabajo = {
  id: "trabajo-1",
  fechaFinalizacion: "2023-01-01T00:00:00.000Z",
  numeroTotalHoras: 40,
  pais: "Colombia",
  nombre: "Curso de Gestión Pública",
  institucion: "ESAP",
  medioCapacitacion: "VIRTUAL",
  modalidad: "EDUCACION_PARA_EL_TRABAJO_Y_DESARROLLO_HUMANO",
  diplomaActaCertificadoEstudio: "/api/archivos/curso.pdf",
};

export const experienciaLaboral = {
  id: "exp-1",
  tipoEntidad: "PUBLICA",
  pais: "Colombia",
  departamento: "Cauca",
  municipio: "Popayán",
  nombreEntidad: "Alcaldía Municipal",
  nombreEntidadEmpresa: "Alcaldía Municipal",
  correoEntidadEmpresa: "contacto@alcaldia.gov.co",
  telefonosEntidadEmpresa: "6020000000",
  telefono: "6020000000",
  tipoZona: "URBANA",
  cargo: "Profesional universitario",
  dependencia: "Planeación",
  direccion: "Centro",
  direccionEntidad: "Centro",
  fechaIngreso: "2021-01-01T00:00:00.000Z",
  trabajoActual: true,
  tiempoExperiencia: 24,
  jornadaLaboral: "TIEMPO_COMPLETO",
  nivelJerarquiaEmpleo: "PROFESIONAL",
  nivelJerarquicoEmpleo: "PROFESIONAL",
  certificadoLaboral: "/api/archivos/certificado-laboral.pdf",
  documentoVerificado: true,
};

export const experienciaDocente = {
  id: "doc-1",
  institucion: "Universidad del Cauca",
  nombreInstitucion: "Universidad del Cauca",
  tipoInstitucion: "PUBLICA",
  pais: "Colombia",
  departamento: "Cauca",
  municipio: "Popayán",
  nivelAcademico: "PREGRADO",
  areaConocimiento: "CIENCIAS_EDUCACION",
  tipoZona: "URBANA",
  jornadaLaboral: "TIEMPO_COMPLETO",
  fechaIngreso: "2020-01-01T00:00:00.000Z",
  horasPromedioMes: 20,
  trabajoActual: false,
  fechaRetiro: "2022-01-01T00:00:00.000Z",
  fechaTerminacion: "2022-01-01T00:00:00.000Z",
  motivoRetiro: "Finalización de contrato",
  telefono: "6021111111",
  materiaImpartida: "Gestión pública",
  tiempoExperiencia: 12,
  certificadoLaboral: "/api/archivos/docente.pdf",
  documentoVerificado: true,
};

export const publicacion = {
  id: "pub-1",
  titulo: "Artículo de gestión pública",
  nombrePublicacion: "Artículo de gestión pública",
  nombreArticulo: "Artículo de gestión pública",
  tipoProduccionBibliografica: "OTRO",
  fecha: "2024-01-01T00:00:00.000Z",
};

export const premio = {
  id: "premio-1",
  nombre: "Reconocimiento institucional",
  tipo: "Reconocimiento",
  fecha: "2024-01-01T00:00:00.000Z",
};

export const proyecto = {
  id: "proyecto-1",
  nombre: "Proyecto de modernización",
  rolDesempeñado: "Líder",
  fechaInicio: "2023-01-01T00:00:00.000Z",
  fechaTerminacion: "2024-01-01T00:00:00.000Z",
};

export const corporacion = {
  id: "corp-1",
  nombreCorporacion: "Consejo profesional",
  nombreEntidadOrganizacion: "Entidad pública",
};
