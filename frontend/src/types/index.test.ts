import { describe, expect, it } from "vitest";
import * as Types from "./index";

describe("types y catálogos", () => {
  it("expone enums y labels usados por formularios", () => {
    expect(Types.TipoIdentificacion.CedulaDeCiudadania).toBe("CedulaDeCiudadania");
    expect(Types.RolUsuario.ServidorPublico).toBe("servidorPublico");
    expect(Types.ClaseLibretaMilitar.Primera).toBe("PRIMERA_CLASE");
    expect(Types.EstadoCivil.UnionLibre).toBe("UNIONLIBRE");
    expect(Types.PreferenciaEtnica.Rrom).toBe("RROM");
    expect(Types.NivelAcademico.Pregrado).toBe("PREGRADO");
    expect(Types.EstadoEstudio.EnProceso).toBe("En_proceso");
    expect(Types.IdiomaNivel.MuyBien).toBe("MUY_BIEN");
    expect(Types.TipoEntidad.Publica).toBe("PUBLICA");
    expect(Types.JornadaLaboral.TiempoCompleto).toBe("TIEMPO_COMPLETO");
    expect(Types.TipoPremioReconocimiento.Reconocimiento).toBe("Reconocimiento");

    expect(Types.TipoIdentificacionLabels[Types.TipoIdentificacion.CedulaDeCiudadania]).toContain("Cédula");
    expect(Types.GeneroLabels[Types.Genero.Femenino]).toBe("Femenino");
    expect(Types.EstadoCivilLabels[Types.EstadoCivil.Soltero]).toContain("Soltero");
    expect(Types.PreferenciaEtnicaLabels[Types.PreferenciaEtnica.Ninguna]).toBe("Ninguna");
    expect(Types.ZonaLabels[Types.Zona.Urbana]).toBe("Urbana");
    expect(Types.NivelAcademicoLabels[Types.NivelAcademico.Pregrado]).toBe("Pregrado");
    expect(Types.NivelFormacionLabels[Types.NivelFormacion.Profesional]).toBe("Profesional");
    expect(Types.AreaConocimientoLabels[Types.AreaConocimiento.NoAplica]).toBe("No aplica");
    expect(Types.EstadoEstudioLabels[Types.EstadoEstudio.Finalizado]).toBe("Finalizado");
    expect(Types.IdiomaNivelLabels[Types.IdiomaNivel.Regular]).toBe("Regular");
  });

  it("convierte labels a entradas de opciones", () => {
    const entries = Types.optionEntries<typeof Types.Genero>(Types.GeneroLabels);
    expect(entries).toEqual(expect.arrayContaining([[Types.Genero.Masculino, "Masculino"]]));
  });
});
