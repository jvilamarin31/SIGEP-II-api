package com.apirest.backend.models.curriculum.sections;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class FormacionAcademica {
    private String nivelAcademico;
    private String nivelFormacion;
    private String areaConocimiento;
    private String pais;
    private String institucionFormacionAcademica;
    private String programaAcademico;
    private String tituloObtenido;
    private String semestresAprobados;
    private String estadoEstudio;
    private Instant fechaTerminacionMaterias;
    private Instant fechaGrado;
    private boolean estudioConvalidado;
    private Instant fechaConvalidacion;
    private String tarjetaProfesional;
    private Instant estudioExterior;
    private String archivoTarjetaProfesioal;
    private boolean verificTarjetaProfesional;
    private String archivoEducacionFormal;
    private boolean verificEducacionFormal;


}
