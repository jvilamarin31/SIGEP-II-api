package com.apirest.backend.controllers;

import com.apirest.backend.dtos.requests.LoginRequest;
import com.apirest.backend.dtos.responses.LoginResponse;
import com.apirest.backend.services.IAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
public class AuthController {


    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    ResponseEntity<LoginResponse> login(@RequestBody LoginRequest usuarioRequest) {
        return ResponseEntity.ok(authService.login(usuarioRequest));
    }

}
