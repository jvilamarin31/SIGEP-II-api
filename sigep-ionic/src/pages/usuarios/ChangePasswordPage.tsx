import React, { useState } from "react";
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
  IonSpinner,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { Haptics } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { authService } from "../../services/api";

const ChangePasswordPage: React.FC = () => {
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
      await authService.cambiarContraseña({ contraseña: form.contraseña });
      setSuccess("Contraseña actualizada correctamente.");
      setForm({ contraseña: "", confirmarContraseña: "" });
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Contraseña cambiada",
            body: "Tu contraseña ha sido actualizada.",
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } catch {
      setError("No fue posible cambiar la contraseña.");
      await Haptics.vibrate();
    } finally {
      setLoading(false);
    }
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Cambiar contraseña</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonLabel position="stacked">Nueva contraseña *</IonLabel>
              <IonInput
                  type="password"
                  value={form.contraseña}
                  onIonChange={(e) => handleChange("contraseña", e.detail.value!)}
                  autocomplete="new-password"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Confirmar contraseña *</IonLabel>
              <IonInput
                  type="password"
                  value={form.confirmarContraseña}
                  onIonChange={(e) => handleChange("confirmarContraseña", e.detail.value!)}
                  autocomplete="new-password"
              />
            </IonItem>

            <IonButton expand="block" type="submit" disabled={loading} className="ion-margin-top">
              {loading ? <IonSpinner name="crescent" /> : "Guardar contraseña"}
            </IonButton>
          </form>

          <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
          <IonToast isOpen={!!success} message={success} duration={3000} onDidDismiss={() => setSuccess("")} />
        </IonContent>
      </IonPage>
  );
};

export default ChangePasswordPage;