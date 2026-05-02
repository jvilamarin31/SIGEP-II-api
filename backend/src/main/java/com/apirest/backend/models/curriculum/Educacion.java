package com.apirest.backend.models.curriculum;

import com.apirest.backend.models.curriculum.sections.EducacionTrabajo;
import com.apirest.backend.models.curriculum.sections.FormacionAcademica;
import com.apirest.backend.models.curriculum.sections.Idioma;

import java.util.ArrayList;

public class Educacion {
    ArrayList<FormacionAcademica> formacionesAcademicas;
    ArrayList<EducacionTrabajo> educacionTrabajos;
    ArrayList<Idioma> idiomas;
}
