package com.apirest.backend.services;


import com.apirest.backend.dtos.requests.curriculums.DatosBasicosRequest;
import com.apirest.backend.models.curriculum.CurriculumModelo;
import com.apirest.backend.models.curriculum.sections.DatosBasicos;
import com.apirest.backend.repositories.ICurriculumRepository;
import org.springframework.stereotype.Service;

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
                        .email(curriculumRequest.getEmail())
                        .genero(curriculumRequest.getGenero())
                        .claseLibretaMilitar(curriculumRequest.getClaseLibretaMilitar())
                        .numeroLibretaMilitar(curriculumRequest.getNumeroLibretaMilitar())
                        .distritoMilitar(curriculumRequest.getDistritoMilitar())
                        .documentoIdentificacion(curriculumRequest.getDocumentoIdentificacion())
                        .documentoVerificado(curriculumRequest.isDocumentoVerificado())
                        .libretaMilitar(curriculumRequest.getLibretaMilitar())
                        .libretaVerificada(curriculumRequest.isLibretaVerificada())
                        .personaExpuestaPoliticamente(curriculumRequest.isPersonaExpuestaPoliticamente())
                        .build());

        curriculumRepository.save(curriculumFinal);
        
    }
}
