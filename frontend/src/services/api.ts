import axios from "axios";
import {
  type CambiarContrasenaRequest,
  type InhabilitarUsuarioRequest,
  type LoginRequest,
  type LoginResponse,
  type NuevoUsuarioRequest,
  type PedirEnlaceEmailRequest,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("sigep_user");
  if (stored) {
    const user = JSON.parse(stored);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Auth
export const authService = {
  login: (data: LoginRequest) =>
      api.post<LoginResponse>("/api/auth/login", data).then((r) => r.data),

  crearUsuario: (data: NuevoUsuarioRequest) =>
      api.post("/api/auth/registro", data).then((r) => r.data),

  pedirEnlace: (data: PedirEnlaceEmailRequest) =>
      api.post<string>("/api/auth/pedirEnlace", data).then((r) => r.data),

  recuperarContrasena: (token: string, data: CambiarContrasenaRequest) =>
      api.post<string>("/api/auth/recuperarContraseña", data, { params: { token } }).then((r) => r.data),

  cambiarContraseña: (data: CambiarContrasenaRequest) =>
      api.put("/api/auth/cambiarContraseña", data).then((r) => r.data),

  inhabilitarUsuario: (data: InhabilitarUsuarioRequest) =>
      api.put("/api/auth/inhabilitarUsuario", data).then((r) => r.data),
};

export default api;