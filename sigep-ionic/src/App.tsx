import React from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import { RolUsuario } from "./types";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DatosPersonalesPage from "./pages/curriculum/DatosPersonalesPage";
import EducacionPage from "./pages/curriculum/EducacionPage";
import ExperienciaPage from "./pages/curriculum/ExperienciaPage";
import GerenciaPublicaPage from "./pages/curriculum/GerenciaPublicaPage";
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
                        <Route exact path="/login" component={LoginPage} />
                        <Route exact path="/recuperar" component={ForgotPasswordPage} />
                        <Route exact path="/reset-password" component={ResetPasswordPage} />

                        <ProtectedRoute
                            exact
                            path="/dashboard"
                            component={() => <MainLayout><DashboardPage /></MainLayout>}
                        />
                        <ProtectedRoute
                            exact
                            path="/curriculum/datos-personales"
                            component={() => <MainLayout><DatosPersonalesPage /></MainLayout>}
                        />
                        <ProtectedRoute
                            exact
                            path="/curriculum/educacion"
                            component={() => <MainLayout><EducacionPage /></MainLayout>}
                        />
                        <ProtectedRoute
                            exact
                            path="/curriculum/experiencia"
                            component={() => <MainLayout><ExperienciaPage /></MainLayout>}
                        />
                        <ProtectedRoute
                            exact
                            path="/curriculum/gerencia-publica"
                            component={() => <MainLayout><GerenciaPublicaPage /></MainLayout>}
                        />
                        <ProtectedRoute
                            exact
                            path="/perfil/cambiar-contrasena"
                            component={() => <MainLayout><ChangePasswordPage /></MainLayout>}
                        />
                        <ProtectedRoute
                            exact
                            path="/usuarios/crear"
                            component={() => <MainLayout><CreateUserPage /></MainLayout>}
                            allowedRoles={[RolUsuario.JefeDeTalentoHumano]}
                        />
                        <ProtectedRoute
                            exact
                            path="/usuarios/inhabilitar"
                            component={() => <MainLayout><DisableUserPage /></MainLayout>}
                            allowedRoles={[RolUsuario.JefeDeTalentoHumano]}
                        />

                        <Redirect exact from="/" to="/dashboard" />
                    </IonRouterOutlet>
                </IonReactRouter>
            </AuthProvider>
        </IonApp>
    );
};

export default App;