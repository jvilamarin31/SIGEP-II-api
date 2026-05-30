import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCheckbox,
  IonText,
  IonSpinner,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { Geolocation } from "@capacitor/geolocation";
import { Haptics } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import FileUploadField from "../../components/common/FileUploadField";
import { curriculumService, getApiError, toInstant } from "../../services/api";
import {
  addDateNotFutureError,
  addNumberRangeError,
  addRequiredDateError,
  addRequiredTextError,
  hasText,
  joinValidationErrors,
} from "../../utils/curriculumValidation";
import {
  ClaseLibretaMilitar,
  EstadoCivil,
  EstadoCivilLabels,
  Genero,
  GeneroLabels,
  PreferenciaEtnica,
  PreferenciaEtnicaLabels,
  TipoIdentificacion,
  TipoIdentificacionLabels,
  Zona,
  ZonaLabels,
  type RegistrarDatosBasicosRequest,
} from "../../types";

const tabs = ["Datos Básicos", "Datos Demográficos", "Datos de Contacto"];
const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

const DatosPersonalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [datosBasicosExistentes, setDatosBasicosExistentes] = useState(false);
  const [datosDemograficosExistentes, setDatosDemograficosExistentes] = useState(false);
  const [datosContactoExistentes, setDatosContactoExistentes] = useState(false);

  const [basicos, setBasicos] = useState({
    nombre: "",
    tipoIdentificacion: TipoIdentificacion.CedulaDeCiudadania,
    numeroIdentificacion: "",
    fechaNacimiento: "",
    email: "",
    genero: Genero.Masculino,
    tieneLibretaMilitar: false,
    claseLibretaMilitar: ClaseLibretaMilitar.Primera,
    numeroLibretaMilitar: "",
    distritoMilitar: "",
    documentoIdentificacion: "",
    documentoVerificado: false,
    libretaMilitar: "",
    libretaVerificada: false,
    personaExpuestaPoliticamente: false,
  });

  const [demo, setDemo] = useState({
    nacionalidad: "Colombiana",
    estadoCivil: EstadoCivil.Soltero,
    preferenciaEtnica: PreferenciaEtnica.Ninguna,
    paisNacimiento: "Colombia",
    departamentoNacimiento: "",
    municipioNacimiento: "",
    discapacidad: false,
  });

  const [contacto, setContacto] = useState({
    paisResidencia: "Colombia",
    departamentoResidencia: "",
    municipioResidencia: "",
    zona: Zona.Urbana,
    direccionResidencia: "",
    telefonoResidencia: "",
    celular: "",
    telefonoOficina: "",
    extension: "",
    emailPersonalPrincipal: "",
    emailOficina: "",
  });

  const obtenerUbicacionActual = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const direccion = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setContacto((prev) => ({ ...prev, direccionResidencia: direccion }));
      const toast = document.createElement("ion-toast");
      toast.message = `Ubicación obtenida: ${direccion}`;
      toast.duration = 2000;
      document.body.appendChild(toast);
      toast.present();
    } catch (err) {
      console.error("Error obteniendo ubicación", err);
      setError("No se pudo obtener la ubicación. Verifica los permisos.");
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError("");

      const cargarBasicos = curriculumService
          .obtenerDatosBasicos()
          .then((data) => {
            const tieneLibreta = Boolean(
                data.claseLibretaMilitar ||
                data.numeroLibretaMilitar ||
                data.distritoMilitar ||
                data.libretaMilitar
            );
            setBasicos((prev) => ({
              ...prev,
              nombre: data.nombre ?? "",
              tipoIdentificacion: data.tipoIdentificacion ?? TipoIdentificacion.CedulaDeCiudadania,
              numeroIdentificacion: data.numeroIdentificacion ?? "",
              fechaNacimiento: toDateInput(data.fechaNacimiento),
              email: data.email ?? "",
              genero: data.genero ?? Genero.Masculino,
              tieneLibretaMilitar: tieneLibreta,
              claseLibretaMilitar: data.claseLibretaMilitar ?? ClaseLibretaMilitar.Primera,
              numeroLibretaMilitar: data.numeroLibretaMilitar ?? "",
              distritoMilitar: data.distritoMilitar ? String(data.distritoMilitar) : "",
              documentoIdentificacion: data.documentoIdentificacion ?? "",
              documentoVerificado: Boolean(data.documentoVerificado),
              libretaMilitar: data.libretaMilitar ?? "",
              libretaVerificada: Boolean(data.libretaVerificada),
              personaExpuestaPoliticamente: Boolean(data.personaExpuestaPoliticamente),
            }));
            setDatosBasicosExistentes(true);
          })
          .catch(() => setDatosBasicosExistentes(false));

      const cargarDemo = curriculumService
          .obtenerDatosDemograficos()
          .then((data) => {
            setDemo({
              nacionalidad: data.nacionalidad ?? "Colombiana",
              estadoCivil: data.estadoCivil ?? EstadoCivil.Soltero,
              preferenciaEtnica: data.preferenciaEtnica ?? PreferenciaEtnica.Ninguna,
              paisNacimiento: data.paisNacimiento ?? "Colombia",
              departamentoNacimiento: data.departamentoNacimiento ?? "",
              municipioNacimiento: data.municipioNacimiento ?? "",
              discapacidad: Boolean(data.discapacidad),
            });
            setDatosDemograficosExistentes(true);
          })
          .catch(() => setDatosDemograficosExistentes(false));

      const cargarContacto = curriculumService
          .obtenerDatosContacto()
          .then((data) => {
            setContacto({
              paisResidencia: data.paisResidencia ?? "Colombia",
              departamentoResidencia: data.departamentoResidencia ?? "",
              municipioResidencia: data.municipioResidencia ?? "",
              zona: data.zona ?? Zona.Urbana,
              direccionResidencia: data.direccionResidencia ?? "",
              telefonoResidencia: data.telefonoResidencia ?? "",
              celular: data.celular ?? "",
              telefonoOficina: data.telefonoOficina ?? "",
              extension: data.extension ?? "",
              emailPersonalPrincipal: data.emailPersonalPrincipal ?? "",
              emailOficina: data.emailOficina ?? "",
            });
            setDatosContactoExistentes(true);
          })
          .catch(() => setDatosContactoExistentes(false));

      await Promise.allSettled([cargarBasicos, cargarDemo, cargarContacto]);
      setLoading(false);
    };
    cargarDatos();
  }, []);

  const showSuccess = async () => {
    setSaved(true);
    await Haptics.vibrate();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Datos guardados",
          body: "La información se ha guardado correctamente.",
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) },
        },
      ],
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const validateActiveTab = () => {
    const errors: string[] = [];
    if (activeTab === 0) {
      addRequiredTextError(errors, basicos.nombre, "Nombre completo");
      addRequiredTextError(errors, basicos.numeroIdentificacion, "Número de identificación");
      addRequiredDateError(errors, basicos.fechaNacimiento, "Fecha de nacimiento");
      addDateNotFutureError(errors, basicos.fechaNacimiento, "Fecha de nacimiento");
      addRequiredTextError(errors, basicos.email, "Correo electrónico institucional");

      if (hasText(basicos.distritoMilitar)) {
        addNumberRangeError(errors, Number(basicos.distritoMilitar), "Distrito militar", 1, 1000000000);
      }

      if (basicos.documentoVerificado && !hasText(basicos.documentoIdentificacion)) {
        errors.push("Carga el documento de identificación antes de marcarlo como verificado.");
      }

      if (basicos.libretaVerificada && !hasText(basicos.libretaMilitar)) {
        errors.push("Carga la libreta militar antes de marcarla como verificada.");
      }
    }

    if (activeTab === 1) {
      addRequiredTextError(errors, demo.nacionalidad, "Nacionalidad");
      addRequiredTextError(errors, demo.paisNacimiento, "País de nacimiento");
      addRequiredTextError(errors, demo.departamentoNacimiento, "Departamento de nacimiento");
      addRequiredTextError(errors, demo.municipioNacimiento, "Municipio de nacimiento");
    }

    if (activeTab === 2) {
      addRequiredTextError(errors, contacto.paisResidencia, "País de residencia");
      addRequiredTextError(errors, contacto.departamentoResidencia, "Departamento de residencia");
      addRequiredTextError(errors, contacto.municipioResidencia, "Municipio de residencia");
      addRequiredTextError(errors, contacto.direccionResidencia, "Dirección de residencia");
      addRequiredTextError(errors, contacto.celular, "Celular");
      addRequiredTextError(errors, contacto.emailPersonalPrincipal, "Correo personal principal");
    }
    return errors;
  };

  const guardarBasicos = async () => {
    const payload: RegistrarDatosBasicosRequest = {
      nombre: basicos.nombre.trim(),
      tipoIdentificacion: basicos.tipoIdentificacion,
      numeroIdentificacion: basicos.numeroIdentificacion.trim(),
      fechaNacimiento: toInstant(basicos.fechaNacimiento) ?? "",
      email: basicos.email.trim(),
      genero: basicos.genero,
      tieneLibretaMilitar: basicos.tieneLibretaMilitar,
      claseLibretaMilitar: basicos.tieneLibretaMilitar ? basicos.claseLibretaMilitar : undefined,
      numeroLibretaMilitar: basicos.tieneLibretaMilitar ? basicos.numeroLibretaMilitar.trim() || undefined : undefined,
      distritoMilitar:
          basicos.tieneLibretaMilitar && basicos.distritoMilitar ? Number(basicos.distritoMilitar) : undefined,
      documentoIdentificacion: basicos.documentoIdentificacion.trim() || undefined,
      documentoVerificado: basicos.documentoVerificado,
      libretaMilitar: basicos.tieneLibretaMilitar ? basicos.libretaMilitar.trim() || undefined : undefined,
      libretaVerificada: basicos.tieneLibretaMilitar ? basicos.libretaVerificada : false,
      personaExpuestaPoliticamente: basicos.personaExpuestaPoliticamente,
    };

    if (datosBasicosExistentes) {
      await curriculumService.actualizarDatosBasicos({
        tieneLibretaMilitar: payload.tieneLibretaMilitar,
        claseLibretaMilitar: payload.claseLibretaMilitar,
        numeroLibretaMilitar: payload.numeroLibretaMilitar,
        distritoMilitar: payload.distritoMilitar,
        documentoIdentificacion: payload.documentoIdentificacion,
        documentoVerificado: payload.documentoVerificado,
        libretaMilitar: payload.libretaMilitar,
        libretaVerificada: payload.libretaVerificada,
        personaExpuestaPoliticamente: payload.personaExpuestaPoliticamente,
      });
      return;
    }
    await curriculumService.registrarDatosBasicos(payload);
    setDatosBasicosExistentes(true);
  };

  const guardarDemograficos = async () => {
    if (!datosBasicosExistentes) throw new Error("Primero debes guardar los datos básicos antes de continuar.");
    const payload = {
      nacionalidad: demo.nacionalidad.trim(),
      estadoCivil: demo.estadoCivil,
      preferenciaEtnica: demo.preferenciaEtnica,
      paisNacimiento: demo.paisNacimiento.trim(),
      departamentoNacimiento: demo.departamentoNacimiento.trim(),
      municipioNacimiento: demo.municipioNacimiento.trim(),
      discapacidad: demo.discapacidad,
    };
    if (datosDemograficosExistentes) {
      await curriculumService.actualizarDatosDemograficos({
        estadoCivil: payload.estadoCivil,
        preferenciaEtnica: payload.preferenciaEtnica,
        discapacidad: payload.discapacidad,
      });
      return;
    }
    await curriculumService.registrarDatosDemograficos(payload);
    setDatosDemograficosExistentes(true);
  };

  const guardarContacto = async () => {
    if (!datosBasicosExistentes) throw new Error("Primero debes guardar los datos básicos antes de continuar.");
    const payload = {
      paisResidencia: contacto.paisResidencia.trim(),
      departamentoResidencia: contacto.departamentoResidencia.trim(),
      municipioResidencia: contacto.municipioResidencia.trim(),
      zona: contacto.zona,
      direccionResidencia: contacto.direccionResidencia.trim(),
      telefonoResidencia: contacto.telefonoResidencia.trim() || undefined,
      celular: contacto.celular.trim(),
      telefonoOficina: contacto.telefonoOficina.trim() || undefined,
      extension: contacto.extension.trim() || undefined,
      emailPersonalPrincipal: contacto.emailPersonalPrincipal.trim(),
      emailOficina: contacto.emailOficina.trim() || undefined,
    };
    if (datosContactoExistentes) {
      await curriculumService.actualizarDatosContacto(payload);
      return;
    }
    await curriculumService.registrarDatosContacto(payload);
    setDatosContactoExistentes(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const validationErrors = validateActiveTab();
    if (validationErrors.length) {
      setError(joinValidationErrors(validationErrors));
      setSaving(false);
      return;
    }

    try {
      if (activeTab === 0) await guardarBasicos();
      if (activeTab === 1) await guardarDemograficos();
      if (activeTab === 2) await guardarContacto();
      await showSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : getApiError(err));
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Error",
            body: "No se pudo guardar la información.",
            id: 2,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
      <IonContent className="ion-padding">
        {loading && (
            <IonText color="medium">
              <p>Cargando datos existentes...</p>
            </IonText>
        )}
        <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
        <IonToast isOpen={saved} message="✅ Información guardada correctamente." duration={3000} onDidDismiss={() => setSaved(false)} />

        <div className="tabs" style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {tabs.map((tab, i) => (
              <IonButton
                  key={tab}
                  fill={activeTab === i ? "solid" : "outline"}
                  onClick={() => setActiveTab(i)}
                  disabled={saving}
              >
                {tab}
              </IonButton>
          ))}
        </div>

        <form onSubmit={handleSave}>
          {activeTab === 0 && (
              <>
                <IonItem>
                  <IonLabel position="stacked">Nombre completo *</IonLabel>
                  <IonInput
                      required
                      disabled={datosBasicosExistentes}
                      value={basicos.nombre}
                      onIonChange={(e) => setBasicos((p) => ({ ...p, nombre: e.detail.value! }))}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Tipo de identificación *</IonLabel>
                  <IonSelect
                      required
                      disabled={datosBasicosExistentes}
                      value={basicos.tipoIdentificacion}
                      onIonChange={(e) => setBasicos((p) => ({ ...p, tipoIdentificacion: e.detail.value }))}
                  >
                    {Object.entries(TipoIdentificacionLabels).map(([val, label]) => (
                        <IonSelectOption key={val} value={val}>
                          {label}
                        </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Número de identificación *</IonLabel>
                  <IonInput
                      required
                      disabled={datosBasicosExistentes}
                      value={basicos.numeroIdentificacion}
                      onIonChange={(e) => setBasicos((p) => ({ ...p, numeroIdentificacion: e.detail.value! }))}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Fecha de nacimiento *</IonLabel>
                  <IonInput
                      type="date"
                      required
                      disabled={datosBasicosExistentes}
                      value={basicos.fechaNacimiento}
                      onIonChange={(e) => setBasicos((p) => ({ ...p, fechaNacimiento: e.detail.value! }))}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Género *</IonLabel>
                  <IonSelect
                      required
                      disabled={datosBasicosExistentes}
                      value={basicos.genero}
                      onIonChange={(e) => setBasicos((p) => ({ ...p, genero: e.detail.value }))}
                  >
                    {Object.entries(GeneroLabels).map(([val, label]) => (
                        <IonSelectOption key={val} value={val}>
                          {label}
                        </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Correo institucional *</IonLabel>
                  <IonInput
                      type="email"
                      required
                      disabled={datosBasicosExistentes}
                      value={basicos.email}
                      onIonChange={(e) => setBasicos((p) => ({ ...p, email: e.detail.value! }))}
                  />
                </IonItem>

                <IonItem lines="none">
                  <IonCheckbox
                      checked={basicos.tieneLibretaMilitar}
                      onIonChange={(e) =>
                          setBasicos((p) => ({
                            ...p,
                            tieneLibretaMilitar: e.detail.checked,
                            numeroLibretaMilitar: e.detail.checked ? p.numeroLibretaMilitar : "",
                            distritoMilitar: e.detail.checked ? p.distritoMilitar : "",
                            libretaMilitar: e.detail.checked ? p.libretaMilitar : "",
                            libretaVerificada: e.detail.checked ? p.libretaVerificada : false,
                          }))
                      }
                  >
                    <IonLabel>Tengo libreta militar</IonLabel>
                  </IonCheckbox>
                </IonItem>

                {basicos.tieneLibretaMilitar && (
                    <>
                      <IonItem>
                        <IonLabel position="stacked">Clase de libreta</IonLabel>
                        <IonSelect
                            value={basicos.claseLibretaMilitar}
                            onIonChange={(e) => setBasicos((p) => ({ ...p, claseLibretaMilitar: e.detail.value }))}
                        >
                          <IonSelectOption value={ClaseLibretaMilitar.Primera}>Primera clase</IonSelectOption>
                          <IonSelectOption value={ClaseLibretaMilitar.Segunda}>Segunda clase</IonSelectOption>
                          <IonSelectOption value={ClaseLibretaMilitar.Provisional}>Provisional</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Número de libreta</IonLabel>
                        <IonInput
                            value={basicos.numeroLibretaMilitar}
                            onIonChange={(e) => setBasicos((p) => ({ ...p, numeroLibretaMilitar: e.detail.value! }))}
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Distrito militar</IonLabel>
                        <IonInput
                            type="number"
                            value={basicos.distritoMilitar}
                            onIonChange={(e) => setBasicos((p) => ({ ...p, distritoMilitar: e.detail.value! }))}
                        />
                      </IonItem>
                      <FileUploadField
                          label="Documento de identificación"
                          value={basicos.documentoIdentificacion}
                          onChange={(url) => setBasicos((p) => ({ ...p, documentoIdentificacion: url, documentoVerificado: false }))}
                      />
                      <FileUploadField
                          label="Libreta militar"
                          value={basicos.libretaMilitar}
                          onChange={(url) => setBasicos((p) => ({ ...p, libretaMilitar: url, libretaVerificada: false }))}
                      />
                      <IonItem lines="none">
                        <IonCheckbox
                            checked={basicos.documentoVerificado}
                            onIonChange={(e) => setBasicos((p) => ({ ...p, documentoVerificado: e.detail.checked }))}
                        >
                          <IonLabel>Documento de identificación verificado</IonLabel>
                        </IonCheckbox>
                      </IonItem>
                      <IonItem lines="none">
                        <IonCheckbox
                            checked={basicos.libretaVerificada}
                            onIonChange={(e) => setBasicos((p) => ({ ...p, libretaVerificada: e.detail.checked }))}
                        >
                          <IonLabel>Libreta verificada</IonLabel>
                        </IonCheckbox>
                      </IonItem>
                    </>
                )}

                <IonItem lines="none">
                  <IonCheckbox
                      checked={basicos.personaExpuestaPoliticamente}
                      onIonChange={(e) => setBasicos((p) => ({ ...p, personaExpuestaPoliticamente: e.detail.checked }))}
                  >
                    <IonLabel>¿Persona expuesta políticamente?</IonLabel>
                  </IonCheckbox>
                </IonItem>
              </>
          )}

          {activeTab === 1 && (
              <>
                <IonItem>
                  <IonLabel position="stacked">Nacionalidad *</IonLabel>
                  <IonInput
                      required
                      disabled={datosDemograficosExistentes}
                      value={demo.nacionalidad}
                      onIonChange={(e) => setDemo((p) => ({ ...p, nacionalidad: e.detail.value! }))}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Estado civil *</IonLabel>
                  <IonSelect
                      required
                      value={demo.estadoCivil}
                      onIonChange={(e) => setDemo((p) => ({ ...p, estadoCivil: e.detail.value }))}
                  >
                    {Object.entries(EstadoCivilLabels).map(([val, label]) => (
                        <IonSelectOption key={val} value={val}>
                          {label}
                        </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Preferencia étnica *</IonLabel>
                  <IonSelect
                      required
                      value={demo.preferenciaEtnica}
                      onIonChange={(e) => setDemo((p) => ({ ...p, preferenciaEtnica: e.detail.value }))}
                  >
                    {Object.entries(PreferenciaEtnicaLabels).map(([val, label]) => (
                        <IonSelectOption key={val} value={val}>
                          {label}
                        </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">País nacimiento *</IonLabel>
                  <IonInput
                      required
                      disabled={datosDemograficosExistentes}
                      value={demo.paisNacimiento}
                      onIonChange={(e) => setDemo((p) => ({ ...p, paisNacimiento: e.detail.value! }))}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Departamento nacimiento *</IonLabel>
                  <IonInput
                      required
                      disabled={datosDemograficosExistentes}
                      value={demo.departamentoNacimiento}
                      onIonChange={(e) => setDemo((p) => ({ ...p, departamentoNacimiento: e.detail.value! }))}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Municipio nacimiento *</IonLabel>
                  <IonInput
                      required
                      disabled={datosDemograficosExistentes}
                      value={demo.municipioNacimiento}
                      onIonChange={(e) => setDemo((p) => ({ ...p, municipioNacimiento: e.detail.value! }))}
                  />
                </IonItem>
                <IonItem lines="none">
                  <IonCheckbox checked={demo.discapacidad} onIonChange={(e) => setDemo((p) => ({ ...p, discapacidad: e.detail.checked }))}>
                    <IonLabel>¿Tiene algún tipo de discapacidad?</IonLabel>
                  </IonCheckbox>
                </IonItem>
              </>
          )}

          {activeTab === 2 && (
              <>
                <IonItem>
                  <IonLabel position="stacked">País residencia *</IonLabel>
                  <IonInput required value={contacto.paisResidencia} onIonChange={(e) => setContacto((p) => ({ ...p, paisResidencia: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Departamento residencia *</IonLabel>
                  <IonInput required value={contacto.departamentoResidencia} onIonChange={(e) => setContacto((p) => ({ ...p, departamentoResidencia: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Municipio residencia *</IonLabel>
                  <IonInput required value={contacto.municipioResidencia} onIonChange={(e) => setContacto((p) => ({ ...p, municipioResidencia: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Zona *</IonLabel>
                  <IonSelect required value={contacto.zona} onIonChange={(e) => setContacto((p) => ({ ...p, zona: e.detail.value }))}>
                    {Object.entries(ZonaLabels).map(([val, label]) => (
                        <IonSelectOption key={val} value={val}>
                          {label}
                        </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Dirección residencia *</IonLabel>
                  <IonInput required value={contacto.direccionResidencia} onIonChange={(e) => setContacto((p) => ({ ...p, direccionResidencia: e.detail.value! }))} />
                </IonItem>
                <IonButton expand="block" onClick={obtenerUbicacionActual} style={{ margin: "8px 0" }}>
                  Usar mi ubicación actual
                </IonButton>
                <IonItem>
                  <IonLabel position="stacked">Celular *</IonLabel>
                  <IonInput required value={contacto.celular} onIonChange={(e) => setContacto((p) => ({ ...p, celular: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Teléfono residencia</IonLabel>
                  <IonInput value={contacto.telefonoResidencia} onIonChange={(e) => setContacto((p) => ({ ...p, telefonoResidencia: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Teléfono oficina</IonLabel>
                  <IonInput value={contacto.telefonoOficina} onIonChange={(e) => setContacto((p) => ({ ...p, telefonoOficina: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Extensión</IonLabel>
                  <IonInput value={contacto.extension} onIonChange={(e) => setContacto((p) => ({ ...p, extension: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Correo personal principal *</IonLabel>
                  <IonInput type="email" required value={contacto.emailPersonalPrincipal} onIonChange={(e) => setContacto((p) => ({ ...p, emailPersonalPrincipal: e.detail.value! }))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Correo de oficina</IonLabel>
                  <IonInput type="email" value={contacto.emailOficina} onIonChange={(e) => setContacto((p) => ({ ...p, emailOficina: e.detail.value! }))} />
                </IonItem>
              </>
          )}

          <div className="ion-margin-top" style={{ display: "flex", justifyContent: "space-between" }}>
            <IonButton
                disabled={activeTab === 0 || saving}
                onClick={() => setActiveTab(activeTab - 1)}
                fill="outline"
            >
              ← Anterior
            </IonButton>
            <div style={{ display: "flex", gap: "8px" }}>
              <IonButton type="submit" disabled={saving}>
                {saving ? <IonSpinner name="crescent" /> : "Guardar sección"}
              </IonButton>
              {activeTab < tabs.length - 1 && (
                  <IonButton onClick={() => setActiveTab(activeTab + 1)} disabled={saving}>
                    Siguiente →
                  </IonButton>
              )}
            </div>
          </div>
        </form>
      </IonContent>
  );
};

export default DatosPersonalesPage;