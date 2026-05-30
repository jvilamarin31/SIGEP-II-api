import React, { useCallback, useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
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
import { Haptics } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import FileUploadField from "../../components/common/FileUploadField";
import { curriculumService, getApiError, toInstant } from "../../services/api";
import {
  addDateNotFutureError,
  addDateOrderError,
  addNumberRangeError,
  addRequiredDateError,
  addRequiredTextError,
  hasText,
  joinValidationErrors,
} from "../../utils/curriculumValidation";
import {
  AreaConocimiento,
  AreaConocimientoLabels,
  EstadoEstudio,
  EstadoEstudioLabels,
  IdiomaNivel,
  IdiomaNivelLabels,
  MedioCapacitacion,
  ModalidadEducacionTrabajo,
  NivelAcademico,
  NivelAcademicoLabels,
  NivelFormacion,
  NivelFormacionLabels,
  type EducacionTrabajo,
  type FormacionAcademica,
  type Idioma,
} from "../../types";

const medioCapacitacionLabels: Record<MedioCapacitacion, string> = {
  [MedioCapacitacion.ADistancia]: "A distancia",
  [MedioCapacitacion.Mixta]: "Mixta",
  [MedioCapacitacion.Multimedia]: "Multimedia",
  [MedioCapacitacion.Otro]: "Otro",
  [MedioCapacitacion.Presencial]: "Presencial",
  [MedioCapacitacion.Virtual]: "Virtual",
};

const modalidadLabels: Record<ModalidadEducacionTrabajo, string> = {
  [ModalidadEducacionTrabajo.EducacionInformal]: "Educación informal",
  [ModalidadEducacionTrabajo.EducacionTrabajoDesarrolloHumano]: "Educación para el trabajo y desarrollo humano",
};

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");
const createClientId = () => `tmp-${crypto.randomUUID()}`;

const emptyFormacion = (): FormacionAcademica => ({
  clientId: createClientId(),
  nivelAcademico: NivelAcademico.Pregrado,
  nivelFormacion: NivelFormacion.Profesional,
  areaConocimiento: AreaConocimiento.NoAplica,
  pais: "Colombia",
  institucionFormacionAcademica: "",
  programaAcademico: "",
  tituloObtenido: "",
  semestresAprobados: undefined,
  estadoEstudio: EstadoEstudio.Finalizado,
  fechaTerminacionMaterias: "",
  fechaGrado: "",
  estudioConvalidado: false,
  fechaConvalidacion: "",
});

const emptyIdioma = (): Idioma => ({
  clientId: createClientId(),
  idioma: "",
  fechaCertificado: "",
  conversacion: IdiomaNivel.Regular,
  lectura: IdiomaNivel.Regular,
  redaccion: IdiomaNivel.Regular,
  lenguaNativa: false,
  certificado: "",
});

const emptyEducacionTrabajo = (): EducacionTrabajo => ({
  clientId: createClientId(),
  fechaFinalizacion: "",
  numeroTotalHoras: 1,
  pais: "Colombia",
  nombre: "",
  institucion: "",
  medioCapacitacion: MedioCapacitacion.Presencial,
  modalidad: ModalidadEducacionTrabajo.EducacionTrabajoDesarrolloHumano,
  diplomaActaCertificadoEstudio: "",
});

const EducacionPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formaciones, setFormaciones] = useState<FormacionAcademica[]>([emptyFormacion()]);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [trabajos, setTrabajos] = useState<EducacionTrabajo[]>([]);

  const cargarEducacion = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    const [formacionesResult, idiomasResult, trabajosResult] = await Promise.allSettled([
      curriculumService.obtenerFormacionesAcademicas(),
      curriculumService.obtenerIdiomas(),
      curriculumService.obtenerEducacionesTrabajo(),
    ]);

    if (formacionesResult.status === "fulfilled" && Array.isArray(formacionesResult.value)) {
      setFormaciones(
          formacionesResult.value.length
              ? formacionesResult.value.map((item) => ({
                id: item.id,
                clientId: item.id ?? createClientId(),
                nivelAcademico: item.nivelAcademico ?? NivelAcademico.Pregrado,
                nivelFormacion: item.nivelFormacion ?? NivelFormacion.Profesional,
                areaConocimiento: item.areaConocimiento ?? AreaConocimiento.NoAplica,
                pais: item.pais ?? "Colombia",
                institucionFormacionAcademica: item.institucion ?? "",
                programaAcademico: item.programaAcademico ?? "",
                tituloObtenido: item.tituloObtenido ?? "",
                semestresAprobados: item.semestresAprobados,
                estadoEstudio: item.estadoEstudio ?? EstadoEstudio.Finalizado,
                fechaTerminacionMaterias: toDateInput(item.fechaTerminacionMaterias),
                fechaGrado: toDateInput(item.fechaGrado),
                estudioConvalidado: Boolean(item.estudioConvalidado),
                fechaConvalidacion: toDateInput(item.fechaConvalidacion),
                tarjetaProfesional: item.tarjetaProfesional ?? "",
                estudioExterior: toDateInput(item.estudioExterior),
                archivoTarjetaProfesioal: item.archivoTarjetaProfesioal ?? "",
                verificTarjetaProfesional: Boolean(item.verificTarjetaProfesional),
                archivoEducacionFormal: item.archivoEducacionFormal ?? "",
                verificEducacionFormal: Boolean(item.verificEducacionFormal),
              }))
              : [emptyFormacion()]
      );
    }

    if (idiomasResult.status === "fulfilled" && Array.isArray(idiomasResult.value)) {
      setIdiomas(
          idiomasResult.value.map((item) => ({
            id: item.id,
            clientId: item.id ?? createClientId(),
            idioma: item.idioma ?? "",
            fechaCertificado: toDateInput(item.fechaCertificado),
            conversacion: item.conversacion ?? IdiomaNivel.Regular,
            lectura: item.lectura ?? IdiomaNivel.Regular,
            redaccion: item.redaccion ?? IdiomaNivel.Regular,
            lenguaNativa: Boolean(item.lenguaNativa),
            certificado: item.certificado ?? "",
          }))
      );
    }

    if (trabajosResult.status === "fulfilled" && Array.isArray(trabajosResult.value)) {
      setTrabajos(
          trabajosResult.value.map((item) => ({
            id: item.id,
            clientId: item.id ?? createClientId(),
            fechaFinalizacion: toDateInput(item.fechaFinalizacion),
            numeroTotalHoras: item.numeroTotalHoras ?? 1,
            pais: item.pais ?? "Colombia",
            nombre: item.nombre ?? "",
            institucion: item.institucion ?? "",
            medioCapacitacion: item.medioCapacitacion ?? MedioCapacitacion.Presencial,
            modalidad: item.modalidad ?? ModalidadEducacionTrabajo.EducacionTrabajoDesarrolloHumano,
            diplomaActaCertificadoEstudio: item.diplomaActaCertificadoEstudio ?? "",
          }))
      );
    }

    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void cargarEducacion(), 0);
    return () => window.clearTimeout(timer);
  }, [cargarEducacion]);

  const updateFormacion = (i: number, field: keyof FormacionAcademica, value: any) => {
    setFormaciones((prev) =>
        prev.map((f, idx) => {
          if (idx !== i) return f;
          const updated = { ...f, [field]: value };
          if (field === "estadoEstudio" && value === EstadoEstudio.EnProceso) {
            updated.fechaTerminacionMaterias = "";
            updated.fechaGrado = "";
          }
          if (field === "estudioConvalidado" && value === false) {
            updated.fechaConvalidacion = "";
          }
          return updated;
        })
    );
  };

  const updateIdioma = (i: number, field: keyof Idioma, value: any) => {
    setIdiomas((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const updateTrabajo = (i: number, field: keyof EducacionTrabajo, value: any) => {
    setTrabajos((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const showSuccess = async () => {
    setSaved(true);
    await Haptics.vibrate();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Educación guardada",
          body: "La información se ha guardado correctamente.",
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) },
        },
      ],
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const validateCurrentTab = () => {
    const errors: string[] = [];

    if (tab === 0) {
      formaciones.forEach((f, index) => {
        const prefix = `Estudio #${index + 1}`;
        addRequiredTextError(errors, f.pais, `${prefix}: país`);
        addRequiredTextError(errors, f.institucionFormacionAcademica, `${prefix}: institución`);
        addRequiredTextError(errors, f.tituloObtenido, `${prefix}: título obtenido`);
        if (f.semestresAprobados !== undefined) {
          addNumberRangeError(errors, f.semestresAprobados, `${prefix}: semestres aprobados`, 0, 12);
        }
        if (f.estadoEstudio === EstadoEstudio.EnProceso) {
          if (hasText(f.fechaTerminacionMaterias) || hasText(f.fechaGrado)) {
            errors.push(`${prefix}: si el estudio está en proceso, no debes registrar fecha de terminación de materias ni fecha de grado.`);
          }
        } else {
          addRequiredDateError(errors, f.fechaTerminacionMaterias, `${prefix}: fecha de terminación de materias`);
          addRequiredDateError(errors, f.fechaGrado, `${prefix}: fecha de grado`);
          addDateNotFutureError(errors, f.fechaTerminacionMaterias, `${prefix}: fecha de terminación de materias`);
          addDateNotFutureError(errors, f.fechaGrado, `${prefix}: fecha de grado`);
          addDateOrderError(
              errors,
              f.fechaTerminacionMaterias,
              f.fechaGrado,
              `${prefix}: la fecha de terminación de materias no puede ser posterior a la fecha de grado.`
          );
        }
        if (f.estudioConvalidado) {
          addRequiredDateError(errors, f.fechaConvalidacion, `${prefix}: fecha de convalidación`);
          addDateNotFutureError(errors, f.fechaConvalidacion, `${prefix}: fecha de convalidación`);
        } else if (hasText(f.fechaConvalidacion)) {
          errors.push(`${prefix}: elimina la fecha de convalidación si el estudio no está convalidado.`);
        }
        addDateNotFutureError(errors, f.estudioExterior, `${prefix}: fecha de estudio en el exterior`);
      });
    }

    if (tab === 1) {
      idiomas.forEach((idioma, index) => {
        const prefix = `Idioma #${index + 1}`;
        addRequiredTextError(errors, idioma.idioma, `${prefix}: idioma`);
        addRequiredDateError(errors, idioma.fechaCertificado, `${prefix}: fecha del certificado`);
        addDateNotFutureError(errors, idioma.fechaCertificado, `${prefix}: fecha del certificado`);
      });
    }

    if (tab === 2) {
      trabajos.forEach((trabajo, index) => {
        const prefix = `Capacitación #${index + 1}`;
        addRequiredTextError(errors, trabajo.nombre, `${prefix}: nombre`);
        addRequiredTextError(errors, trabajo.institucion, `${prefix}: institución`);
        addRequiredTextError(errors, trabajo.pais, `${prefix}: país`);
        addRequiredDateError(errors, trabajo.fechaFinalizacion, `${prefix}: fecha de finalización`);
        addDateNotFutureError(errors, trabajo.fechaFinalizacion, `${prefix}: fecha de finalización`);
        addNumberRangeError(errors, trabajo.numeroTotalHoras, `${prefix}: total de horas`, 1, 1000000000);
        addRequiredTextError(errors, trabajo.diplomaActaCertificadoEstudio, `${prefix}: diploma, acta o certificado`);
      });
    }

    return errors;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const validationErrors = validateCurrentTab();
    if (validationErrors.length) {
      setError(joinValidationErrors(validationErrors));
      setSaving(false);
      return;
    }

    try {
      if (tab === 0) {
        await Promise.all(
            formaciones.map((f) => {
              if (f.id) {
                return curriculumService.actualizarFormacionAcademica({
                  formacionId: f.id,
                  areaConocimiento: f.areaConocimiento || undefined,
                  programaAcademico: f.programaAcademico.trim() || undefined,
                  semestresAprobados: f.semestresAprobados,
                  estadoEstudio: f.estadoEstudio,
                  fechaTerminacionMaterias: toInstant(f.fechaTerminacionMaterias),
                  fechaGrado: toInstant(f.fechaGrado),
                  estudioConvalidado: f.estudioConvalidado,
                  fechaConvalidacion: toInstant(f.fechaConvalidacion),
                  tarjetaProfesional: f.tarjetaProfesional?.trim() || undefined,
                  estudioExterior: toInstant(f.estudioExterior),
                  archivoTarjetaProfesioal: f.archivoTarjetaProfesioal?.trim() || undefined,
                  verificTarjetaProfesional: f.verificTarjetaProfesional,
                  archivoEducacionFormal: f.archivoEducacionFormal?.trim() || undefined,
                  verificEducacionFormal: f.verificEducacionFormal,
                });
              }
              return curriculumService.registrarFormacionAcademica({
                nivelAcademico: f.nivelAcademico as NivelAcademico,
                nivelFormacion: f.nivelFormacion as NivelFormacion,
                areaConocimiento: f.areaConocimiento as AreaConocimiento,
                pais: f.pais.trim(),
                institucion: f.institucionFormacionAcademica.trim(),
                programaAcademico: f.programaAcademico.trim() || undefined,
                tituloObtenido: f.tituloObtenido.trim(),
                semestresAprobados: f.semestresAprobados,
                estadoEstudio: f.estadoEstudio,
                fechaTerminacionMaterias: toInstant(f.fechaTerminacionMaterias),
                fechaGrado: toInstant(f.fechaGrado),
                estudioConvalidado: f.estudioConvalidado,
                fechaConvalidacion: toInstant(f.fechaConvalidacion),
                tarjetaProfesional: f.tarjetaProfesional?.trim() || undefined,
                estudioExterior: toInstant(f.estudioExterior),
                archivoTarjetaProfesional: (f.archivoTarjetaProfesional ?? f.archivoTarjetaProfesioal)?.trim() || undefined,
                verificTarjetaProfesional: f.verificTarjetaProfesional,
                archivoEducacionFormal: f.archivoEducacionFormal?.trim() || undefined,
                verificEducacionFormal: f.verificEducacionFormal,
              });
            })
        );
      }

      if (tab === 1) {
        await Promise.all(
            idiomas.map((idioma) => {
              if (idioma.id) {
                return curriculumService.actualizarIdioma({
                  idiomaId: idioma.id,
                  certificado: idioma.certificado?.trim() || undefined,
                });
              }
              return curriculumService.registrarIdioma({
                idioma: idioma.idioma.trim(),
                fechaCertificado: toInstant(idioma.fechaCertificado) ?? "",
                conversacion: idioma.conversacion as IdiomaNivel,
                lectura: idioma.lectura as IdiomaNivel,
                redaccion: idioma.redaccion as IdiomaNivel,
                lenguaNativa: idioma.lenguaNativa,
                certificado: idioma.certificado?.trim() || undefined,
              });
            })
        );
      }

      if (tab === 2) {
        await Promise.all(
            trabajos.map((trabajo) => {
              if (trabajo.id) {
                return curriculumService.actualizarEducacionTrabajo({
                  educacionTrabajoId: trabajo.id,
                  diplomaActaCertificadoEstudio: trabajo.diplomaActaCertificadoEstudio.trim() || undefined,
                });
              }
              return curriculumService.registrarEducacionTrabajo({
                ...trabajo,
                fechaFinalizacion: toInstant(trabajo.fechaFinalizacion) ?? "",
                nombre: trabajo.nombre.trim(),
                institucion: trabajo.institucion.trim(),
                pais: trabajo.pais.trim(),
                diplomaActaCertificadoEstudio: trabajo.diplomaActaCertificadoEstudio.trim(),
              });
            })
        );
      }

      await cargarEducacion(true);
      await showSuccess();
    } catch (err) {
      setError(getApiError(err));
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Error",
            body: "No se pudo guardar la información de educación.",
            id: 2,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormacionFieldDisabled = (field: keyof FormacionAcademica, hasId: boolean) => {
    if (!hasId) return false;
    const nonUpdatableFields: (keyof FormacionAcademica)[] = [
      "nivelAcademico",
      "nivelFormacion",
      "pais",
      "institucionFormacionAcademica",
      "tituloObtenido",
    ];
    return nonUpdatableFields.includes(field);
  };

  const isIdiomaFieldDisabled = (field: keyof Idioma, hasId: boolean) => {
    if (!hasId) return false;
    const updatableFields: (keyof Idioma)[] = ["certificado"];
    return !updatableFields.includes(field);
  };

  const isTrabajoFieldDisabled = (field: keyof EducacionTrabajo, hasId: boolean) => {
    if (!hasId) return false;
    const updatableFields: (keyof EducacionTrabajo)[] = ["diplomaActaCertificadoEstudio"];
    return !updatableFields.includes(field);
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Educación</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {loading && (
              <IonText color="medium">
                <p>Cargando educación guardada...</p>
              </IonText>
          )}
          <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
          <IonToast isOpen={saved} message="✅ Información guardada correctamente." duration={3000} onDidDismiss={() => setSaved(false)} />

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {["Formación Académica", "Idiomas", "Educación para el Trabajo"].map((t, i) => (
                <IonButton key={t} fill={tab === i ? "solid" : "outline"} onClick={() => setTab(i)} disabled={saving}>
                  {t}
                </IonButton>
            ))}
          </div>

          <form onSubmit={handleSave}>
            {tab === 0 && (
                <>
                  <IonText color="medium">
                    <p>Puede agregar varias formaciones. Guarde los cambios cuando termine de completar la información.</p>
                  </IonText>
                  {formaciones.map((f, i) => {
                    const hasId = !!f.id;
                    const isDisabled = (field: keyof FormacionAcademica) => isFormacionFieldDisabled(field, hasId);
                    return (
                        <div key={f.id ?? f.clientId ?? i} style={{ marginBottom: "24px", border: "1px solid var(--ion-color-medium)", borderRadius: "8px", padding: "12px" }}>
                          <h3>
                            Estudio #{i + 1} {hasId ? "(existente)" : "(nuevo)"}
                            {hasId ? null : formaciones.length > 1 && (
                                <IonButton fill="clear" color="danger" onClick={() => setFormaciones((prev) => prev.filter((_, idx) => idx !== i))}>
                                  Quitar
                                </IonButton>
                            )}
                          </h3>
                          <IonItem>
                            <IonLabel position="stacked">Nivel académico *</IonLabel>
                            <IonSelect required disabled={isDisabled("nivelAcademico")} value={f.nivelAcademico} onIonChange={(e) => updateFormacion(i, "nivelAcademico", e.detail.value)}>
                              {Object.entries(NivelAcademicoLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Nivel de formación *</IonLabel>
                            <IonSelect required disabled={isDisabled("nivelFormacion")} value={f.nivelFormacion} onIonChange={(e) => updateFormacion(i, "nivelFormacion", e.detail.value)}>
                              {Object.entries(NivelFormacionLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Área de conocimiento</IonLabel>
                            <IonSelect value={f.areaConocimiento} onIonChange={(e) => updateFormacion(i, "areaConocimiento", e.detail.value)}>
                              {Object.entries(AreaConocimientoLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">País *</IonLabel>
                            <IonInput required disabled={isDisabled("pais")} value={f.pais} onIonChange={(e) => updateFormacion(i, "pais", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Institución *</IonLabel>
                            <IonInput required disabled={isDisabled("institucionFormacionAcademica")} value={f.institucionFormacionAcademica} onIonChange={(e) => updateFormacion(i, "institucionFormacionAcademica", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Programa académico</IonLabel>
                            <IonInput value={f.programaAcademico} onIonChange={(e) => updateFormacion(i, "programaAcademico", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Título obtenido *</IonLabel>
                            <IonInput required disabled={isDisabled("tituloObtenido")} value={f.tituloObtenido} onIonChange={(e) => updateFormacion(i, "tituloObtenido", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Estado del estudio *</IonLabel>
                            <IonSelect required value={f.estadoEstudio} onIonChange={(e) => updateFormacion(i, "estadoEstudio", e.detail.value)}>
                              {Object.entries(EstadoEstudioLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Semestres aprobados</IonLabel>
                            <IonInput type="number" value={f.semestresAprobados ?? ""} onIonChange={(e) => updateFormacion(i, "semestresAprobados", e.detail.value ? Number(e.detail.value) : undefined)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Fecha terminación materias</IonLabel>
                            <IonInput type="date" disabled={f.estadoEstudio === EstadoEstudio.EnProceso} value={f.fechaTerminacionMaterias} onIonChange={(e) => updateFormacion(i, "fechaTerminacionMaterias", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Fecha de grado</IonLabel>
                            <IonInput type="date" disabled={f.estadoEstudio === EstadoEstudio.EnProceso} value={f.fechaGrado} onIonChange={(e) => updateFormacion(i, "fechaGrado", e.detail.value!)} />
                          </IonItem>
                          <FileUploadField label="Soporte de educación formal" value={f.archivoEducacionFormal} onChange={(url) => updateFormacion(i, "archivoEducacionFormal", url)} />
                          <FileUploadField label="Tarjeta profesional" value={f.archivoTarjetaProfesional ?? f.archivoTarjetaProfesioal} onChange={(url) => {
                            updateFormacion(i, "archivoTarjetaProfesional", url);
                            updateFormacion(i, "archivoTarjetaProfesioal", url);
                          }} />
                          <IonItem lines="none">
                            <IonCheckbox checked={f.estudioConvalidado} onIonChange={(e) => updateFormacion(i, "estudioConvalidado", e.detail.checked)}>
                              <IonLabel>¿Estudio convalidado?</IonLabel>
                            </IonCheckbox>
                          </IonItem>
                          {f.estudioConvalidado && (
                              <IonItem>
                                <IonLabel position="stacked">Fecha de convalidación *</IonLabel>
                                <IonInput type="date" required value={f.fechaConvalidacion ?? ""} onIonChange={(e) => updateFormacion(i, "fechaConvalidacion", e.detail.value!)} />
                              </IonItem>
                          )}
                        </div>
                    );
                  })}
                  <IonButton expand="block" onClick={() => setFormaciones((prev) => [...prev, emptyFormacion()])}>
                    + Agregar otra formación
                  </IonButton>
                </>
            )}

            {tab === 1 && (
                <>
                  <IonText color="medium">
                    <p>Puede agregar varios idiomas. Para cambiar un idioma ya guardado, solo puede modificar el certificado.</p>
                  </IonText>
                  {idiomas.length === 0 && <IonText color="medium"><p>No ha registrado idiomas. Agregue uno a continuación.</p></IonText>}
                  {idiomas.map((idioma, i) => {
                    const hasId = !!idioma.id;
                    const isDisabled = (field: keyof Idioma) => isIdiomaFieldDisabled(field, hasId);
                    return (
                        <div key={idioma.id ?? idioma.clientId ?? i} style={{ marginBottom: "24px", border: "1px solid var(--ion-color-medium)", borderRadius: "8px", padding: "12px" }}>
                          <h3>
                            Idioma #{i + 1} {hasId ? "(existente)" : "(nuevo)"}
                            {hasId ? null : <IonButton fill="clear" color="danger" onClick={() => setIdiomas((prev) => prev.filter((_, idx) => idx !== i))}>Quitar</IonButton>}
                          </h3>
                          <IonItem>
                            <IonLabel position="stacked">Idioma *</IonLabel>
                            <IonInput required disabled={isDisabled("idioma")} value={idioma.idioma} onIonChange={(e) => updateIdioma(i, "idioma", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Conversación *</IonLabel>
                            <IonSelect required disabled={isDisabled("conversacion")} value={idioma.conversacion} onIonChange={(e) => updateIdioma(i, "conversacion", e.detail.value)}>
                              {Object.entries(IdiomaNivelLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Lectura *</IonLabel>
                            <IonSelect required disabled={isDisabled("lectura")} value={idioma.lectura} onIonChange={(e) => updateIdioma(i, "lectura", e.detail.value)}>
                              {Object.entries(IdiomaNivelLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Redacción *</IonLabel>
                            <IonSelect required disabled={isDisabled("redaccion")} value={idioma.redaccion} onIonChange={(e) => updateIdioma(i, "redaccion", e.detail.value)}>
                              {Object.entries(IdiomaNivelLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Fecha del certificado *</IonLabel>
                            <IonInput type="date" required disabled={isDisabled("fechaCertificado")} value={idioma.fechaCertificado} onIonChange={(e) => updateIdioma(i, "fechaCertificado", e.detail.value!)} />
                          </IonItem>
                          <FileUploadField label="Certificado" value={idioma.certificado} onChange={(url) => updateIdioma(i, "certificado", url)} />
                          <IonItem lines="none">
                            <IonCheckbox checked={idioma.lenguaNativa} onIonChange={(e) => updateIdioma(i, "lenguaNativa", e.detail.checked)} disabled={isDisabled("lenguaNativa")}>
                              <IonLabel>¿Es lengua nativa?</IonLabel>
                            </IonCheckbox>
                          </IonItem>
                        </div>
                    );
                  })}
                  <IonButton expand="block" onClick={() => setIdiomas((prev) => [...prev, emptyIdioma()])}>
                    + Agregar idioma
                  </IonButton>
                </>
            )}

            {tab === 2 && (
                <>
                  <IonText color="medium">
                    <p>Puede agregar varias capacitaciones. Para cambiar una capacitación ya guardada, solo puede modificar el diploma, acta o certificado.</p>
                  </IonText>
                  {trabajos.length === 0 && <IonText color="medium"><p>No ha registrado educación para el trabajo.</p></IonText>}
                  {trabajos.map((trabajo, i) => {
                    const hasId = !!trabajo.id;
                    const isDisabled = (field: keyof EducacionTrabajo) => isTrabajoFieldDisabled(field, hasId);
                    return (
                        <div key={trabajo.id ?? trabajo.clientId ?? i} style={{ marginBottom: "24px", border: "1px solid var(--ion-color-medium)", borderRadius: "8px", padding: "12px" }}>
                          <h3>
                            Capacitación #{i + 1} {hasId ? "(existente)" : "(nuevo)"}
                            {hasId ? null : <IonButton fill="clear" color="danger" onClick={() => setTrabajos((prev) => prev.filter((_, idx) => idx !== i))}>Quitar</IonButton>}
                          </h3>
                          <IonItem>
                            <IonLabel position="stacked">Nombre *</IonLabel>
                            <IonInput required disabled={isDisabled("nombre")} value={trabajo.nombre} onIonChange={(e) => updateTrabajo(i, "nombre", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Institución *</IonLabel>
                            <IonInput required disabled={isDisabled("institucion")} value={trabajo.institucion} onIonChange={(e) => updateTrabajo(i, "institucion", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">País *</IonLabel>
                            <IonInput required disabled={isDisabled("pais")} value={trabajo.pais} onIonChange={(e) => updateTrabajo(i, "pais", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Fecha finalización *</IonLabel>
                            <IonInput type="date" required disabled={isDisabled("fechaFinalizacion")} value={trabajo.fechaFinalizacion} onIonChange={(e) => updateTrabajo(i, "fechaFinalizacion", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Total horas *</IonLabel>
                            <IonInput type="number" required disabled={isDisabled("numeroTotalHoras")} value={trabajo.numeroTotalHoras} onIonChange={(e) => updateTrabajo(i, "numeroTotalHoras", Number(e.detail.value))} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Medio de capacitación *</IonLabel>
                            <IonSelect required disabled={isDisabled("medioCapacitacion")} value={trabajo.medioCapacitacion} onIonChange={(e) => updateTrabajo(i, "medioCapacitacion", e.detail.value)}>
                              {Object.entries(medioCapacitacionLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Modalidad *</IonLabel>
                            <IonSelect required disabled={isDisabled("modalidad")} value={trabajo.modalidad} onIonChange={(e) => updateTrabajo(i, "modalidad", e.detail.value)}>
                              {Object.entries(modalidadLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <FileUploadField label="Diploma / acta / certificado" required value={trabajo.diplomaActaCertificadoEstudio} onChange={(url) => updateTrabajo(i, "diplomaActaCertificadoEstudio", url)} />
                        </div>
                    );
                  })}
                  <IonButton expand="block" onClick={() => setTrabajos((prev) => [...prev, emptyEducacionTrabajo()])}>
                    + Agregar educación para el trabajo
                  </IonButton>
                </>
            )}

            <div className="ion-margin-top" style={{ display: "flex", justifyContent: "flex-end" }}>
              <IonButton type="submit" disabled={saving}>
                {saving ? <IonSpinner name="crescent" /> : "Guardar sección"}
              </IonButton>
            </div>
          </form>
        </IonContent>
      </IonPage>
  );
};

export default EducacionPage;