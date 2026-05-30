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

const CreateUserPage: React.FC = () => {
  const [form, setForm] = useState({
    tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
    numeroIdentificacion: "",
    email: "",
    contraseña: "",
    confirmarContraseña: "",
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

    if (!form.numeroIdentificacion.trim() || !form.email.trim() || !form.contraseña) {
      setError("Complete todos los campos obligatorios.");
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
      await authService.crearUsuario({
        tipoIdentificacion: form.tipoIdentificacion,
        numeroIdentificacion: form.numeroIdentificacion.trim(),
        email: form.email.trim(),
        contraseña: form.contraseña,
      });
      setSuccess("Usuario creado correctamente.");
      setForm({
        tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
        numeroIdentificacion: "",
        email: "",
        contraseña: "",
        confirmarContraseña: "",
      });
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Usuario creado",
            body: "El usuario ha sido registrado exitosamente.",
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } catch {
      setError("No fue posible crear el usuario. Verifique los datos o permisos.");
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
            <IonLabel position="stacked">Correo electrónico *</IonLabel>
            <IonInput
                type="email"
                value={form.email}
                onIonChange={(e) => handleChange("email", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Contraseña *</IonLabel>
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
            {loading ? <IonSpinner name="crescent" /> : "Crear usuario"}
          </IonButton>
        </form>

        <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
        <IonToast isOpen={!!success} message={success} duration={3000} onDidDismiss={() => setSuccess("")} />
      </IonContent>
  );
};

export default CreateUserPage;