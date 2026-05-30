import React from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { RolUsuario } from "./types";

/* Core CSS required for Ionic components */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/global.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

// Páginas de autenticación
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Páginas de currículum
import DatosPersonalesPage from "./pages/curriculum/DatosPersonalesPage";
import EducacionPage from "./pages/curriculum/EducacionPage";
import ExperienciaPage from "./pages/curriculum/ExperienciaPage";
import GerenciaPublicaPage from "./pages/curriculum/GerenciaPublicaPage";

// Páginas de dashboard
import DashboardPage from "./pages/dashboard/DashboardPage";

// Páginas de usuario
import ChangePasswordPage from "./pages/usuarios/ChangePasswordPage";
import CreateUserPage from "./pages/usuarios/CreateUserPage";
import DisableUserPage from "./pages/usuarios/DisableUserPage";

setupIonicReact();

const App: React.FC = () => {
    return (
        <IonApp>
            <AuthProvider>
                <IonReactRouter>
                    <IonRouterOutlet>
                        {/* Rutas públicas */}
                        <Route exact path="/login" component={LoginPage} />
                        <Route exact path="/recuperar" component={ForgotPasswordPage} />
                        <Route exact path="/reset-password" component={ResetPasswordPage} />

                        {/* Rutas protegidas con layout de menú */}
                        <Route
                            exact
                            path="/dashboard"
                            render={() => (
                                <ProtectedRoute>
                                    <MainLayout>
                                        <DashboardPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            exact
                            path="/curriculum/datos-personales"
                            render={() => (
                                <ProtectedRoute>
                                    <MainLayout>
                                        <DatosPersonalesPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            exact
                            path="/curriculum/educacion"
                            render={() => (
                                <ProtectedRoute>
                                    <MainLayout>
                                        <EducacionPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            exact
                            path="/curriculum/experiencia"
                            render={() => (
                                <ProtectedRoute>
                                    <MainLayout>
                                        <ExperienciaPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            exact
                            path="/curriculum/gerencia-publica"
                            render={() => (
                                <ProtectedRoute>
                                    <MainLayout>
                                        <GerenciaPublicaPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            exact
                            path="/perfil/cambiar-contrasena"
                            render={() => (
                                <ProtectedRoute>
                                    <MainLayout>
                                        <ChangePasswordPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            exact
                            path="/usuarios/crear"
                            render={() => (
                                <ProtectedRoute allowedRoles={[RolUsuario.JefeDeTalentoHumano]}>
                                    <MainLayout>
                                        <CreateUserPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            exact
                            path="/usuarios/inhabilitar"
                            render={() => (
                                <ProtectedRoute allowedRoles={[RolUsuario.JefeDeTalentoHumano]}>
                                    <MainLayout>
                                        <DisableUserPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            )}
                        />

                        {/* Redirección por defecto */}
                        <Redirect exact from="/" to="/dashboard" />
                    </IonRouterOutlet>
                </IonReactRouter>
            </AuthProvider>
        </IonApp>
    );
};

export default App;