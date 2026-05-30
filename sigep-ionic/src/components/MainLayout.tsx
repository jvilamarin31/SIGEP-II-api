import React from "react";
import {
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonButtons,
} from "@ionic/react";
import {
    homeOutline,
    personOutline,
    schoolOutline,
    briefcaseOutline,
    businessOutline,
    peopleOutline,
    banOutline,
    keyOutline,
    logOutOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RolUsuario } from "../types";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const history = useHistory();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        history.push("/login");
    };

    const canManageUsers = user?.rol === RolUsuario.JefeDeTalentoHumano;

    return (
        <IonSplitPane contentId="main-content" when="md">
            <IonMenu contentId="main-content" type="overlay">
                <IonHeader>
                    <IonToolbar color="primary">
                        <IonTitle>SIGEP II</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonList>
                        <IonItem
                            button
                            routerLink="/dashboard"
                            routerDirection="none"
                            color={location.pathname === "/dashboard" ? "primary" : undefined}
                        >
                            <IonIcon icon={homeOutline} slot="start" />
                            <IonLabel>Inicio</IonLabel>
                        </IonItem>
                        <IonItem
                            button
                            routerLink="/curriculum/datos-personales"
                            routerDirection="none"
                            color={location.pathname === "/curriculum/datos-personales" ? "primary" : undefined}
                        >
                            <IonIcon icon={personOutline} slot="start" />
                            <IonLabel>Datos Personales</IonLabel>
                        </IonItem>
                        <IonItem
                            button
                            routerLink="/curriculum/educacion"
                            routerDirection="none"
                            color={location.pathname === "/curriculum/educacion" ? "primary" : undefined}
                        >
                            <IonIcon icon={schoolOutline} slot="start" />
                            <IonLabel>Educación</IonLabel>
                        </IonItem>
                        <IonItem
                            button
                            routerLink="/curriculum/experiencia"
                            routerDirection="none"
                            color={location.pathname === "/curriculum/experiencia" ? "primary" : undefined}
                        >
                            <IonIcon icon={briefcaseOutline} slot="start" />
                            <IonLabel>Experiencia Laboral</IonLabel>
                        </IonItem>
                        <IonItem
                            button
                            routerLink="/curriculum/gerencia-publica"
                            routerDirection="none"
                            color={location.pathname === "/curriculum/gerencia-publica" ? "primary" : undefined}
                        >
                            <IonIcon icon={businessOutline} slot="start" />
                            <IonLabel>Gerencia Pública</IonLabel>
                        </IonItem>
                        <IonItem
                            button
                            routerLink="/perfil/cambiar-contrasena"
                            routerDirection="none"
                            color={location.pathname === "/perfil/cambiar-contrasena" ? "primary" : undefined}
                        >
                            <IonIcon icon={keyOutline} slot="start" />
                            <IonLabel>Cambiar Contraseña</IonLabel>
                        </IonItem>
                        {canManageUsers && (
                            <>
                                <IonItem
                                    button
                                    routerLink="/usuarios/crear"
                                    routerDirection="none"
                                    color={location.pathname === "/usuarios/crear" ? "primary" : undefined}
                                >
                                    <IonIcon icon={peopleOutline} slot="start" />
                                    <IonLabel>Crear Usuario</IonLabel>
                                </IonItem>
                                <IonItem
                                    button
                                    routerLink="/usuarios/inhabilitar"
                                    routerDirection="none"
                                    color={location.pathname === "/usuarios/inhabilitar" ? "primary" : undefined}
                                >
                                    <IonIcon icon={banOutline} slot="start" />
                                    <IonLabel>Inhabilitar Usuario</IonLabel>
                                </IonItem>
                            </>
                        )}
                        <IonItem button onClick={handleLogout}>
                            <IonIcon icon={logOutOutline} slot="start" />
                            <IonLabel>Salir</IonLabel>
                        </IonItem>
                    </IonList>
                </IonContent>
            </IonMenu>

            <div id="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>SIGEP II</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={handleLogout}>
                                <IonIcon icon={logOutOutline} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    {children}
                </IonContent>
            </div>
        </IonSplitPane>
    );
};

export default MainLayout;