import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonAlert,
  IonSpinner,
} from "@ionic/react";
import { authService } from "../../services/api";

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") || "";

  const [form, setForm] = useState({ contraseña: "", confirmarContraseña: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("El enlace de recuperación no es válido.");
      return;
    }
    if (form.contraseña.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }
    if (form.contraseña !== form.confirmarContraseña) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const message = await authService.recuperarContrasena(token, { contraseña: form.contraseña });
      setSuccess(message || "Contraseña actualizada correctamente.");
      setForm({ contraseña: "", confirmarContraseña: "" });
    } catch {
      setError("No fue posible cambiar la contraseña. Solicita un nuevo enlace e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Nueva contraseña</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonLabel position="stacked">Nueva contraseña</IonLabel>
              <IonInput
                  name="contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.contraseña}
                  onIonChange={(e) => handleChange("contraseña", e.detail.value!)}
                  autocomplete="new-password"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Confirmar contraseña</IonLabel>
              <IonInput
                  name="confirmarContraseña"
                  type="password"
                  placeholder="Repita la contraseña"
                  value={form.confirmarContraseña}
                  onIonChange={(e) => handleChange("confirmarContraseña", e.detail.value!)}
                  autocomplete="new-password"
              />
            </IonItem>

            <IonButton expand="block" type="submit" disabled={loading || !token} className="ion-margin-top">
              {loading ? <IonSpinner name="crescent" /> : "Cambiar contraseña"}
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

export default ResetPasswordPage;