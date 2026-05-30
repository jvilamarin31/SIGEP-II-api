import React, { useState } from "react";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { Haptics } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { authService } from "../../services/api";
import { TipoIdentificacion, TipoIdentificacionLabels } from "../../types";

const DisableUserPage: React.FC = () => {
  const [form, setForm] = useState({
    tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
    numeroIdentificacion: "",
    fechaFin: "",
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

    if (!form.numeroIdentificacion.trim() || !form.fechaFin) {
      setError("Complete todos los campos obligatorios.");
      return;
    }

    const fechaFinISO = new Date(form.fechaFin).toISOString();

    setLoading(true);
    try {
      await authService.inhabilitarUsuario({
        tipoIdentificacion: form.tipoIdentificacion,
        numeroIdentificacion: form.numeroIdentificacion.trim(),
        fechaFin: fechaFinISO,
      });
      setSuccess("Usuario inhabilitado correctamente.");
      setForm({
        tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
        numeroIdentificacion: "",
        fechaFin: "",
      });
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Usuario inhabilitado",
            body: "El usuario ha sido inhabilitado exitosamente.",
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } catch {
      setError("No fue posible inhabilitar el usuario. Verifique los datos o permisos.");
      await Haptics.vibrate();
    } finally {
      setLoading(false);
    }
  };

  return (
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">Tipo de identificación *</IonLabel>
            <IonSelect
                value={form.tipoIdentificacion}
                onIonChange={(e) => handleChange("tipoIdentificacion", e.detail.value)}
            >
              {Object.entries(TipoIdentificacionLabels).map(([val, label]) => (
                  <IonSelectOption key={val} value={val}>{label}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Número de identificación *</IonLabel>
            <IonInput
                value={form.numeroIdentificacion}
                onIonChange={(e) => handleChange("numeroIdentificacion", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Fecha final *</IonLabel>
            <IonInput
                type="datetime-local"
                value={form.fechaFin}
                onIonChange={(e) => handleChange("fechaFin", e.detail.value!)}
            />
          </IonItem>

          <IonButton expand="block" type="submit" disabled={loading} className="ion-margin-top" color="danger">
            {loading ? <IonSpinner name="crescent" /> : "Inhabilitar usuario"}
          </IonButton>
        </form>

        <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
        <IonToast isOpen={!!success} message={success} duration={3000} onDidDismiss={() => setSuccess("")} />
      </IonContent>
  );
};

export default DisableUserPage;