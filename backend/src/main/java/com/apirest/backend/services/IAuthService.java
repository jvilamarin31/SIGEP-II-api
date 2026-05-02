package com.apirest.backend.services;

import com.apirest.backend.dtos.requests.InhabilitarRequest;
import com.apirest.backend.dtos.requests.LoginRequest;
import com.apirest.backend.dtos.requests.NuevoUsuarioRequest;
import com.apirest.backend.dtos.requests.RecuperarConRequest;
import com.apirest.backend.dtos.responses.LoginResponse;

public interface IAuthService {
    public LoginResponse login(LoginRequest usuarioRequest);
    public void recuperarContraseña(RecuperarConRequest usuarioRequest);
    public void cambiarContraseña(String contraseña);
    public void crearUsuario(NuevoUsuarioRequest usuarioRequest);
    public void inhabilitarUsuario(InhabilitarRequest usuarioRequest);
}
