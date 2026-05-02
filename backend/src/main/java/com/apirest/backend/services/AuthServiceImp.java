package com.apirest.backend.services;

import com.apirest.backend.dtos.requests.InhabilitarRequest;
import com.apirest.backend.dtos.requests.LoginRequest;
import com.apirest.backend.dtos.requests.NuevoUsuarioRequest;
import com.apirest.backend.dtos.requests.RecuperarConRequest;
import com.apirest.backend.dtos.responses.LoginResponse;
import com.apirest.backend.exceptions.InvalidCredentialsException;
import com.apirest.backend.exceptions.UserNotFoundException;
import com.apirest.backend.jwts.JwtService;
import com.apirest.backend.models.UsuarioModelo;
import com.apirest.backend.repositories.IUsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthServiceImp implements IAuthService{

    private final IUsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImp(IUsuarioRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    public LoginResponse login(LoginRequest usuarioRequest) {
        Optional<UsuarioModelo> usuarioExiste = usuarioRepository.findByNumeroDocumentoAndTipoDocumento(usuarioRequest.getNumeroIdentificacion(), usuarioRequest.getTipoDocumento());
        if (!usuarioExiste.isPresent()) {
            throw new UserNotFoundException(usuarioRequest.getNumeroIdentificacion());
        }
        UsuarioModelo usuarioFinal = usuarioExiste.get();
        if(!passwordEncoder.matches(usuarioRequest.getContraseña(), usuarioFinal.getContraseña())){
            throw new InvalidCredentialsException();
        }
        String tokenUsuario = jwtService.generarToken(usuarioFinal.getId(), usuarioFinal.getRol(), usuarioFinal.getNumeroIdentificacion());
        LoginResponse usuarioResponse = LoginResponse.builder()
                .tipoIdentificacion(usuarioFinal.getTipoIdentificacion())
                .numeroIdentificacion(usuarioFinal.getNumeroIdentificacion())
                .token(tokenUsuario)
                .build();
        return usuarioResponse;
    }

    @Override
    @Transactional
    public void recuperarContraseña(RecuperarConRequest usuarioRequest) {

    }

    @Override
    public void cambiarContraseña(String contraseña) {

    }

    @Override
    public void crearUsuario(NuevoUsuarioRequest usuarioRequest) {

    }

    @Override
    public void inhabilitarUsuario(InhabilitarRequest usuarioRequest) {

    }
}
