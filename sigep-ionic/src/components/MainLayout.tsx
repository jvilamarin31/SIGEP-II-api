import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    IonButton,
    IonButtons,
    IonMenuButton,
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
import { useAuth } from "../hooks/useAuth";
import { RolUsuario, TipoIdentificacionLabels } from "../types";

interface NavItem {
    label: string;
    path: string;
    icon: string;
}

const mainNavItems: NavItem[] = [
    { label: "Inicio", path: "/dashboard", icon: homeOutline },
    { label: "Datos Personales", path: "/curriculum/datos-personales", icon: personOutline },
    { label: "Educación", path: "/curriculum/educacion", icon: schoolOutline },
    { label: "Experiencia Laboral", path: "/curriculum/experiencia", icon: briefcaseOutline },
    { label: "Gerencia Pública", path: "/curriculum/gerencia-publica", icon: businessOutline },
];

const managementNavItems: NavItem[] = [
    { label: "Crear usuario", path: "/usuarios/crear", icon: peopleOutline },
    { label: "Inhabilitar usuario", path: "/usuarios/inhabilitar", icon: banOutline },
];

const profileNavItems: NavItem[] = [
    { label: "Cambiar contraseña", path: "/perfil/cambiar-contrasena", icon: keyOutline },
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const history = useHistory();

    const handleLogout = () => {
        logout();
        history.push("/login");
    };

    const initials = user?.numeroIdentificacion?.slice(-2).toUpperCase() ?? "US";
    const tipoIdentificacionLabel = user?.tipoIdentificacion
        ? TipoIdentificacionLabels[user.tipoIdentificacion]
        : "Usuario";

    const roleLabel = user?.rol === RolUsuario.JefeDeTalentoHumano
        ? "Jefe de Talento Humano"
        : "Servidor Público";

    const canManageUsers = user?.rol === RolUsuario.JefeDeTalentoHumano;

    return (
        <>
            <IonMenu contentId="main-content" side="start" type="overlay">
                <IonHeader>
                    <IonToolbar color="primary">
                        <IonTitle>SIGEP II</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonList>
                        <IonItem lines="none" className="ion-margin-vertical">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className="avatar" style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--ion-color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                    {initials}
                                </div>
                                <div>
                                    <div><strong>{user?.numeroIdentificacion ?? "Usuario"}</strong></div>
                                    <div style={{ fontSize: "0.8rem" }}>{roleLabel}</div>
                                </div>
                            </div>
                        </IonItem>

                        <IonItem lines="full">
                            <IonLabel>Principal</IonLabel>
                        </IonItem>
                        {mainNavItems.map((item) => (
                            <IonMenuToggle key={item.path}>
                                <IonItem
                                    button
                                    routerLink={item.path}
                                    routerDirection="none"
                                    color={location.pathname === item.path ? "primary" : undefined}
                                >
                                    <IonIcon icon={item.icon} slot="start" />
                                    <IonLabel>{item.label}</IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                        ))}

                        {canManageUsers && (
                            <>
                                <IonItem lines="full">
                                    <IonLabel>Usuarios</IonLabel>
                                </IonItem>
                                {managementNavItems.map((item) => (
                                    <IonMenuToggle key={item.path}>
                                        <IonItem
                                            button
                                            routerLink={item.path}
                                            routerDirection="none"
                                            color={location.pathname === item.path ? "primary" : undefined}
                                        >
                                            <IonIcon icon={item.icon} slot="start" />
                                            <IonLabel>{item.label}</IonLabel>
                                        </IonItem>
                                    </IonMenuToggle>
                                ))}
                            </>
                        )}

                        <IonItem lines="full">
                            <IonLabel>Perfil</IonLabel>
                        </IonItem>
                        {profileNavItems.map((item) => (
                            <IonMenuToggle key={item.path}>
                                <IonItem
                                    button
                                    routerLink={item.path}
                                    routerDirection="none"
                                    color={location.pathname === item.path ? "primary" : undefined}
                                >
                                    <IonIcon icon={item.icon} slot="start" />
                                    <IonLabel>{item.label}</IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                        ))}

                        <IonMenuToggle>
                            <IonItem button onClick={handleLogout}>
                                <IonIcon icon={logOutOutline} slot="start" />
                                <IonLabel>Salir</IonLabel>
                            </IonItem>
                        </IonMenuToggle>
                    </IonList>
                </IonContent>
            </IonMenu>

            <div id="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>SIGEP II</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={handleLogout}>
                                <IonIcon icon={logOutOutline} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {children}
                </IonContent>
            </div>
        </>
    );
};

export default MainLayout;