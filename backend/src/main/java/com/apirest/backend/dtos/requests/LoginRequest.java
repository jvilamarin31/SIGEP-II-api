package com.apirest.backend.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Validated
public class LoginRequest {
    @NotBlank
    private String tipoDocumento;
    @NotBlank
    private String numeroIdentificacion;
    private String contraseña;
}
