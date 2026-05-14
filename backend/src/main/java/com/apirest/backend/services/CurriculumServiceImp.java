package com.apirest.backend.services;


import com.apirest.backend.dtos.requests.curriculums.DatosBasicosRequest;
import com.apirest.backend.models.curriculum.CurriculumModelo;
import com.apirest.backend.models.curriculum.sections.DatosBasicos;
import com.apirest.backend.models.enums.ClaseLibretaMilitarCurriculum;
import com.apirest.backend.models.enums.GeneroCurriculum;
import com.apirest.backend.models.enums.TipoIdentificacionUsuarios;
import com.apirest.backend.repositories.ICurriculumRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class CurriculumServiceImp implements ICurriculumService{
    private final ICurriculumRepository curriculumRepository;

    public CurriculumServiceImp(ICurriculumRepository curriculumRepository) {
        this.curriculumRepository = curriculumRepository;
    }


    @Override
    public void registrarDatosPersonalesBasicos(String usuarioId, DatosBasicosRequest curriculumRequest) {
        Optional<CurriculumModelo> curriculumExiste = curriculumRepository.findByUsuarioId(usuarioId);
        CurriculumModelo curriculumFinal;
        if (!curriculumExiste.isPresent()){
            curriculumFinal = new CurriculumModelo();
            curriculumFinal.setUsuarioId(usuarioId);
        } else {
            curriculumFinal = curriculumExiste.get();
        }
        curriculumFinal.getDatosPersonales().setDatosBasicos(DatosBasicos.builder()
                        .nombre(curriculumRequest.getNombre())
                        .tipoIdentificacion(curriculumRequest.getTipoIdentificacion())
                        .numeroIdentificacion(curriculumRequest.getNumeroIdentificacion())
                        .fechaNacimiento(curriculumRequest.getFechaNacimiento())
                        .
                .build());
        private TipoIdentificacionUsuarios tipoIdentificacion;
        private String numeroIdentificacion;
        private Instant fechaNacimiento;
        private String email;
        private GeneroCurriculum genero;
        private ClaseLibretaMilitarCurriculum claseLibretaMilitar;
        private String numeroLibretaMilitar;
        private Integer distritoMilitar;
        private String documentoIdentificacion;
        private boolean documentoVerificado;
        private String libretaMilitar;
        private boolean libretaVerificada;
        private boolean personaExpuestaPoliticamente;
    }
}
