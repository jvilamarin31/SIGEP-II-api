package com.apirest.backend.services;

import com.apirest.backend.dtos.requests.curriculums.DatosBasicosRequest;

public interface ICurriculumService {
    public void registrarDatosPersonalesBasicos(String idUsuario,DatosBasicosRequest curriculumRequest);
}
