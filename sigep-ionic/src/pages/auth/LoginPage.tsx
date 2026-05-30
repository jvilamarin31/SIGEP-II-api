import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonText,
  IonAlert,
  IonSpinner,
} from "@ionic/react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/api";
import { TipoIdentificacion, TipoIdentificacionLabels } from "../../types";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();

  useEffect(() => {
    localStorage.removeItem("sigep_user");
  }, []);

  const [form, setForm] = useState({
    tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
    numeroIdentificacion: "",
    contraseña: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numeroIdentificacion || !form.contraseña) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res);
      history.push("/dashboard");
    } catch {
      setError("Credenciales inválidas. Verifique su número de identificación y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Iniciar sesión</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonLabel position="stacked">Tipo de documento</IonLabel>
              <IonSelect
                  name="tipoIdentificacion"
                  value={form.tipoIdentificacion}
                  onIonChange={(e) => handleChange("tipoIdentificacion", e.detail.value)}
              >
                {Object.entries(TipoIdentificacionLabels).map(([value, label]) => (
                    <IonSelectOption key={value} value={value}>
                      {label}
                    </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Número de identificación</IonLabel>
              <IonInput
                  name="numeroIdentificacion"
                  type="text"
                  placeholder="Ej: 1234567890"
                  value={form.numeroIdentificacion}
                  onIonChange={(e) => handleChange("numeroIdentificacion", e.detail.value!)}
                  autocomplete="username"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                  name="contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={form.contraseña}
                  onIonChange={(e) => handleChange("contraseña", e.detail.value!)}
                  autocomplete="current-password"
              />
            </IonItem>

            <IonButton expand="block" type="submit" disabled={loading} className="ion-margin-top">
              {loading ? <IonSpinner name="crescent" /> : "Ingresar al sistema"}
            </IonButton>

            <IonText color="medium" className="ion-text-center ion-margin-top">
              <p>
                ¿Problemas para acceder?{" "}
                <Link to="/recuperar" style={{ color: "var(--ion-color-primary)" }}>
                  Recuperar contraseña
                </Link>
              </p>
            </IonText>
          </form>

          <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
        </IonContent>
      </IonPage>
  );
};

export default LoginPage;