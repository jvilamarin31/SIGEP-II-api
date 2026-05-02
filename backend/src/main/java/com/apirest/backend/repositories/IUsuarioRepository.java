package com.apirest.backend.repositories;

import com.apirest.backend.models.UsuarioModelo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface IUsuarioRepository extends MongoRepository<UsuarioModelo, String> {

    Optional<UsuarioModelo> findById(String id);
    Optional<UsuarioModelo> findByNumeroDocumentoAndTipoDocumento(String numeroDocumento, String tipoDocumento);
}
