import React, { useRef, useState } from "react";
import {
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    IonIcon,
    IonAlert,
    IonText,
} from "@ionic/react";
import { camera, documentAttach, trashBin, eye } from "ionicons/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { fileService, getApiError } from "../../services/api";

interface FileUploadFieldProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    required?: boolean;
    disabled?: boolean;
    helperText?: string;
}

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png";

const fileNameFromUrl = (url?: string) => {
    if (!url) return "";
    const clean = url.split("?")[0];
    return clean.substring(clean.lastIndexOf("/") + 1) || "Documento cargado";
};

const FileUploadField: React.FC<FileUploadFieldProps> = ({
                                                             label,
                                                             value,
                                                             onChange,
                                                             required,
                                                             disabled,
                                                             helperText = "PDF, JPG o PNG. Máximo 10 MB.",
                                                         }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    // Subir archivo (desde input file o desde blob de cámara)
    const uploadFile = async (file: File) => {
        setError("");
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`El documento no puede superar ${MAX_SIZE_MB} MB.`);
            return false;
        }
        try {
            setUploading(true);
            const uploaded = await fileService.subirArchivo(file);
            onChange(uploaded.url);
            return true;
        } catch (err) {
            setError(getApiError(err));
            return false;
        } finally {
            setUploading(false);
        }
    };

    // Manejo de archivo desde input nativo
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const success = await uploadFile(file);
        if (success) event.target.value = "";
    };

    // Tomar foto o seleccionar de galería con Capacitor Camera
    const handleCamera = async () => {
        try {
            const photo = await Camera.getPhoto({
                resultType: CameraResultType.Uri,
                source: CameraSource.Prompt, // pregunta: tomar foto o galería
                quality: 80,
                allowEditing: false,
            });
            if (photo.webPath) {
                // Convertir la URI a un objeto File
                const response = await fetch(photo.webPath);
                const blob = await response.blob();
                const file = new File([blob], `foto_${Date.now()}.jpg`, { type: "image/jpeg" });
                await uploadFile(file);
            }
        } catch (err) {
            if (err instanceof Error && err.message !== "User cancelled photos app") {
                setError("No se pudo acceder a la cámara o galería.");
            }
        }
    };

    const handleOpen = async () => {
        if (!value) return;
        setError("");
        try {
            await fileService.verArchivo(value);
        } catch (err) {
            setError(getApiError(err));
        }
    };

    return (
        <>
            <IonItem lines="none">
                <IonLabel position="stacked">
                    {label} {required && <span style={{ color: "var(--ion-color-danger)" }}>*</span>}
                </IonLabel>
            </IonItem>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                <IonButton
                    fill="outline"
                    expand="block"
                    disabled={uploading || disabled}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <IonIcon icon={documentAttach} slot="start" />
                    Subir archivo
                </IonButton>
                <IonButton
                    fill="outline"
                    expand="block"
                    disabled={uploading || disabled}
                    onClick={handleCamera}
                >
                    <IonIcon icon={camera} slot="start" />
                    Cámara / Galería
                </IonButton>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />

            <IonText color="medium" style={{ fontSize: "0.8rem", display: "block", marginTop: 4 }}>
                {uploading ? "Cargando documento..." : helperText}
            </IonText>

            {value && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ background: "var(--ion-color-success)", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem" }}>
            Documento cargado
          </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--ion-color-medium)" }}>
            {fileNameFromUrl(value)}
          </span>
                    <IonButton fill="clear" size="small" onClick={handleOpen} disabled={uploading}>
                        <IonIcon icon={eye} />
                    </IonButton>
                    {!disabled && (
                        <IonButton fill="clear" size="small" color="danger" onClick={() => onChange("")} disabled={uploading}>
                            <IonIcon icon={trashBin} />
                        </IonButton>
                    )}
                </div>
            )}

            <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
        </>
    );
};

export default FileUploadField;