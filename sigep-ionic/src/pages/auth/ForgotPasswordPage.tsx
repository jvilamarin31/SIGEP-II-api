import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { authService } from "../../services/api";
import { TipoIdentificacion, TipoIdentificacionLabels } from "../../types";

const ForgotPasswordPage: React.FC = () => {
  const [form, setForm] = useState({
    tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
    numeroIdentificacion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numeroIdentificacion.trim()) {
      setError("Ingrese el número de identificación.");
      return;
    }

    setLoading(true);
    try {
      const message = await authService.pedirEnlace(form);
      setSuccess(message || "Se ha enviado un enlace a su correo electrónico.");
    } catch {
      setError("No fue posible enviar el enlace. Verifique los datos e inténtelo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Recuperar contraseña</IonTitle>
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

            <IonButton expand="block" type="submit" disabled={loading} className="ion-margin-top">
              {loading ? <IonSpinner name="crescent" /> : "Enviar enlace"}
            </IonButton>

            <IonText color="medium" className="ion-text-center ion-margin-top">
              <p>
                <Link to="/login" style={{ color: "var(--ion-color-primary)" }}>
                  Volver al inicio de sesión
                </Link>
              </p>
            </IonText>
          </form>

          <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
          <IonAlert isOpen={!!success} message={success} buttons={["OK"]} onDidDismiss={() => setSuccess("")} />
        </IonContent>
      </IonPage>
  );
};

export default ForgotPasswordPage;