package com.apirest.backend.dtos.requests;

import com.apirest.backend.models.enums.TipoIdentificacionUsuarios;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Validated
public class InhabilitarRequest {
    @NotBlank
    private TipoIdentificacionUsuarios tipoIdentificacion;
    @NotBlank
    private String numeroIdentificacion;
    @NotBlank
    private Instant fechaFin;
}
