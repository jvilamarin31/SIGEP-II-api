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
  JornadaLaboral,
  JornadaLaboralLabels,
  NivelAcademico,
  NivelAcademicoLabels,
  NivelJerarquicoEmpleo,
  NivelJerarquicoEmpleoLabels,
  TipoEntidad,
  TipoEntidadLabels,
  TipoInstitucion,
  TipoInstitucionLabels,
  TipoZona,
  TipoZonaLabels,
  type ExperienciaLaboral,
  type ExperienciaLaboralDocente,
} from "../../types";

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");
const createClientId = () => `tmp-${crypto.randomUUID()}`;

const emptyExp = (): ExperienciaLaboral => ({
  clientId: createClientId(),
  tipoEntidad: TipoEntidad.Publica,
  nombreEntidad: "",
  pais: "Colombia",
  departamento: "",
  municipio: "",
  direccionEntidad: "",
  dependencia: "",
  nivelJerarquiaEmpleo: NivelJerarquicoEmpleo.Profesional,
  cargo: "",
  telefono: "",
  trabajoActual: false,
  fechaIngreso: "",
  fechaRetiro: "",
  jornadaLaboral: JornadaLaboral.TiempoCompleto,
  horasPromedioMes: 1,
  tiempoExperiencia: 1,
  motivoRetiro: "",
  certificadoLaboral: "",
  documentoVerificado: false,
});

const emptyDocente = (): ExperienciaLaboralDocente => ({
  clientId: createClientId(),
  tipoInstitucion: TipoInstitucion.Publica,
  nombreInstitucion: "",
  pais: "Colombia",
  departamento: "",
  municipio: "",
  nivelAcademico: NivelAcademico.Pregrado,
  areaConocimiento: AreaConocimiento.CienciasEducacion,
  tipoZona: TipoZona.Urbana,
  trabajoActual: false,
  fechaIngreso: "",
  fechaTerminacion: "",
  jornadaLaboral: JornadaLaboral.TiempoCompleto,
  horasPromedioMes: 1,
  motivoRetiro: "",
  telefono: "",
  materiaImpartida: "",
  tiempoExperiencia: 1,
  certificadoLaboral: "",
  documentoVerificado: false,
});

const ExperienciaPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exps, setExps] = useState<ExperienciaLaboral[]>([emptyExp()]);
  const [docentes, setDocentes] = useState<ExperienciaLaboralDocente[]>([]);

  const cargarExperiencia = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    const [experienciasResult, docentesResult] = await Promise.allSettled([
      curriculumService.obtenerExperienciasLaborales(),
      curriculumService.obtenerExperienciasDocentes(),
    ]);

    if (experienciasResult.status === "fulfilled" && Array.isArray(experienciasResult.value)) {
      setExps(
          experienciasResult.value.length
              ? experienciasResult.value.map((item) => ({
                id: item.id,
                clientId: item.id ?? createClientId(),
                tipoEntidad: item.tipoEntidad ?? TipoEntidad.Publica,
                nombreEntidad: item.nombreEntidad ?? "",
                pais: item.pais ?? "Colombia",
                departamento: item.departamento ?? "",
                municipio: item.municipio ?? "",
                direccionEntidad: item.direccionEntidad ?? "",
                dependencia: item.dependencia ?? "",
                nivelJerarquiaEmpleo: item.nivelJerarquiaEmpleo ?? NivelJerarquicoEmpleo.Profesional,
                cargo: item.cargo ?? "",
                telefono: item.telefono ?? "",
                trabajoActual: Boolean(item.trabajoActual),
                fechaIngreso: toDateInput(item.fechaIngreso),
                fechaRetiro: toDateInput(item.fechaRetiro),
                jornadaLaboral: item.jornadaLaboral ?? JornadaLaboral.TiempoCompleto,
                horasPromedioMes: item.horasPromedioMes ?? 1,
                tiempoExperiencia: item.tiempoExperiencia ?? 1,
                motivoRetiro: item.motivoRetiro ?? "",
                certificadoLaboral: item.certificadoLaboral ?? "",
                documentoVerificado: Boolean(item.documentoVerificado),
              }))
              : [emptyExp()]
      );
    }

    if (docentesResult.status === "fulfilled" && Array.isArray(docentesResult.value)) {
      setDocentes(
          docentesResult.value.map((item) => ({
            id: item.id,
            clientId: item.id ?? createClientId(),
            tipoInstitucion: item.tipoInstitucion ?? TipoInstitucion.Publica,
            nombreInstitucion: item.nombreInstitucion ?? "",
            pais: item.pais ?? "Colombia",
            departamento: item.departamento ?? "",
            municipio: item.municipio ?? "",
            nivelAcademico: item.nivelAcademico ?? NivelAcademico.Pregrado,
            areaConocimiento: item.areaConocimiento ?? AreaConocimiento.CienciasEducacion,
            tipoZona: item.tipoZona ?? TipoZona.Urbana,
            trabajoActual: Boolean(item.trabajoActual),
            fechaIngreso: toDateInput(item.fechaIngreso),
            fechaTerminacion: toDateInput(item.fechaTerminacion),
            jornadaLaboral: item.jornadaLaboral ?? JornadaLaboral.TiempoCompleto,
            horasPromedioMes: item.horasPromedioMes ?? 1,
            motivoRetiro: item.motivoRetiro ?? "",
            telefono: item.telefono ?? "",
            materiaImpartida: item.materiaImpartida ?? "",
            tiempoExperiencia: item.tiempoExperiencia ?? 1,
            certificadoLaboral: item.certificadoLaboral ?? "",
            documentoVerificado: Boolean(item.documentoVerificado),
          }))
      );
    }

    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void cargarExperiencia(), 0);
    return () => window.clearTimeout(timer);
  }, [cargarExperiencia]);

  const updateExp = (i: number, field: keyof ExperienciaLaboral, value: any) => {
    setExps((prev) =>
        prev.map((item, idx) => {
          if (idx !== i) return item;
          const updated = { ...item, [field]: value };
          if (field === "trabajoActual" && value === true) {
            updated.fechaRetiro = "";
            updated.motivoRetiro = "";
          }
          return updated;
        })
    );
  };

  const updateDocente = (i: number, field: keyof ExperienciaLaboralDocente, value: any) => {
    setDocentes((prev) =>
        prev.map((item, idx) => {
          if (idx !== i) return item;
          const updated = { ...item, [field]: value };
          if (field === "trabajoActual" && value === true) {
            updated.fechaTerminacion = "";
            updated.motivoRetiro = "";
          }
          return updated;
        })
    );
  };

  const showSuccess = async () => {
    setSaved(true);
    await Haptics.vibrate();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Experiencia guardada",
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
      exps.forEach((exp, index) => {
        const prefix = `Empleo #${index + 1}`;
        addRequiredTextError(errors, exp.nombreEntidad, `${prefix}: nombre de la entidad o empresa`);
        addRequiredTextError(errors, exp.pais, `${prefix}: país`);
        addRequiredTextError(errors, exp.departamento, `${prefix}: departamento`);
        addRequiredTextError(errors, exp.municipio, `${prefix}: municipio`);
        addRequiredTextError(errors, exp.direccionEntidad, `${prefix}: dirección de la entidad`);
        addRequiredTextError(errors, exp.cargo, `${prefix}: cargo`);
        addRequiredTextError(errors, exp.dependencia, `${prefix}: dependencia`);
        addRequiredDateError(errors, exp.fechaIngreso, `${prefix}: fecha de ingreso`);
        addDateNotFutureError(errors, exp.fechaIngreso, `${prefix}: fecha de ingreso`);
        addNumberRangeError(errors, exp.horasPromedioMes, `${prefix}: horas promedio por mes`, 1, 744);
        addNumberRangeError(errors, exp.tiempoExperiencia, `${prefix}: tiempo de experiencia`, 1, 1000000000);

        if (exp.trabajoActual) {
          if (hasText(exp.fechaRetiro) || hasText(exp.motivoRetiro)) {
            errors.push(`${prefix}: si es trabajo actual, no debes registrar fecha ni motivo de retiro.`);
          }
        } else {
          addRequiredDateError(errors, exp.fechaRetiro, `${prefix}: fecha de retiro`);
          addDateNotFutureError(errors, exp.fechaRetiro, `${prefix}: fecha de retiro`);
          addDateOrderError(errors, exp.fechaIngreso, exp.fechaRetiro, `${prefix}: la fecha de retiro no puede ser anterior a la fecha de ingreso.`);
        }

        if (exp.documentoVerificado && !hasText(exp.certificadoLaboral)) {
          errors.push(`${prefix}: carga el certificado laboral antes de marcarlo como verificado.`);
        }
      });
    }

    if (tab === 1) {
      docentes.forEach((doc, index) => {
        const prefix = `Docencia #${index + 1}`;
        addRequiredTextError(errors, doc.nombreInstitucion, `${prefix}: nombre de la institución`);
        addRequiredTextError(errors, doc.pais, `${prefix}: país`);
        addRequiredTextError(errors, doc.departamento, `${prefix}: departamento`);
        addRequiredTextError(errors, doc.municipio, `${prefix}: municipio`);
        addRequiredDateError(errors, doc.fechaIngreso, `${prefix}: fecha de ingreso`);
        addDateNotFutureError(errors, doc.fechaIngreso, `${prefix}: fecha de ingreso`);
        addNumberRangeError(errors, doc.horasPromedioMes, `${prefix}: horas promedio por mes`, 1, 744);
        addNumberRangeError(errors, doc.tiempoExperiencia, `${prefix}: tiempo de experiencia`, 1, 1000000000);

        if (doc.trabajoActual) {
          if (hasText(doc.fechaTerminacion) || hasText(doc.motivoRetiro)) {
            errors.push(`${prefix}: si es trabajo actual, no debes registrar fecha de terminación ni motivo de retiro.`);
          }
        } else {
          addRequiredDateError(errors, doc.fechaTerminacion, `${prefix}: fecha de terminación`);
          addDateNotFutureError(errors, doc.fechaTerminacion, `${prefix}: fecha de terminación`);
          addDateOrderError(errors, doc.fechaIngreso, doc.fechaTerminacion, `${prefix}: la fecha de terminación no puede ser anterior a la fecha de ingreso.`);
        }

        if (doc.documentoVerificado && !hasText(doc.certificadoLaboral)) {
          errors.push(`${prefix}: carga el certificado laboral antes de marcarlo como verificado.`);
        }
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
            exps.map((exp) => {
              if (exp.id) {
                return curriculumService.actualizarExperienciaLaboral({
                  experienciaLaboralId: exp.id,
                  telefono: exp.telefono?.trim() || undefined,
                  fechaRetiro: exp.trabajoActual ? undefined : toInstant(exp.fechaRetiro),
                  horasPromedioMes: exp.horasPromedioMes,
                  motivoRetiro: exp.trabajoActual ? undefined : exp.motivoRetiro?.trim() || undefined,
                  certificadoLaboral: exp.certificadoLaboral?.trim() || undefined,
                  documentoVerificado: exp.documentoVerificado,
                });
              }
              return curriculumService.registrarExperienciaLaboral({
                tipoEntidad: exp.tipoEntidad as TipoEntidad,
                nombreEntidad: exp.nombreEntidad.trim(),
                pais: exp.pais.trim(),
                departamento: exp.departamento.trim(),
                municipio: exp.municipio.trim(),
                direccionEntidad: exp.direccionEntidad.trim(),
                dependencia: exp.dependencia.trim(),
                nivelJerarquicoEmpleo: exp.nivelJerarquiaEmpleo as NivelJerarquicoEmpleo,
                cargo: exp.cargo.trim(),
                telefono: exp.telefono?.trim() || undefined,
                trabajoActual: exp.trabajoActual,
                fechaIngreso: toInstant(exp.fechaIngreso) ?? "",
                fechaRetiro: exp.trabajoActual ? undefined : toInstant(exp.fechaRetiro),
                jornadaLaboral: exp.jornadaLaboral as JornadaLaboral,
                horasPromedioMes: exp.horasPromedioMes,
                tiempoExperiencia: Math.max(1, Number(exp.tiempoExperiencia || 1)),
                motivoRetiro: exp.trabajoActual ? undefined : exp.motivoRetiro?.trim() || undefined,
                certificadoLaboral: exp.certificadoLaboral?.trim() || undefined,
                documentoVerificado: exp.documentoVerificado,
              });
            })
        );
      }

      if (tab === 1) {
        await Promise.all(
            docentes.map((doc) => {
              if (doc.id) {
                return curriculumService.actualizarExperienciaLaboralDocente({
                  experienciaLaboralDocenteId: doc.id,
                  fechaTerminacion: doc.trabajoActual ? undefined : toInstant(doc.fechaTerminacion),
                  horasPromedioMes: doc.horasPromedioMes,
                  motivoRetiro: doc.trabajoActual ? undefined : doc.motivoRetiro?.trim() || undefined,
                  telefono: doc.telefono?.trim() || undefined,
                  materiaImpartida: doc.materiaImpartida?.trim() || undefined,
                  certificadoLaboral: doc.certificadoLaboral?.trim() || undefined,
                  documentoVerificado: doc.documentoVerificado,
                });
              }
              return curriculumService.registrarExperienciaLaboralDocente({
                tipoInstitucion: doc.tipoInstitucion as TipoInstitucion,
                nombreInstitucion: doc.nombreInstitucion.trim(),
                pais: doc.pais.trim(),
                departamento: doc.departamento.trim(),
                municipio: doc.municipio.trim(),
                nivelAcademico: doc.nivelAcademico as NivelAcademico,
                areaConocimiento: doc.areaConocimiento as AreaConocimiento,
                tipoZona: doc.tipoZona as TipoZona,
                trabajoActual: doc.trabajoActual,
                fechaIngreso: toInstant(doc.fechaIngreso) ?? "",
                fechaTerminacion: doc.trabajoActual ? undefined : toInstant(doc.fechaTerminacion),
                jornadaLaboral: doc.jornadaLaboral as JornadaLaboral,
                horasPromedioMes: doc.horasPromedioMes,
                motivoRetiro: doc.trabajoActual ? undefined : doc.motivoRetiro?.trim() || undefined,
                telefono: doc.telefono?.trim() || undefined,
                materiaImpartida: doc.materiaImpartida?.trim() || undefined,
                tiempoExperiencia: Math.max(1, Number(doc.tiempoExperiencia || 1)),
                certificadoLaboral: doc.certificadoLaboral?.trim() || undefined,
                documentoVerificado: doc.documentoVerificado,
              });
            })
        );
      }

      await cargarExperiencia(true);
      await showSuccess();
    } catch (err) {
      setError(getApiError(err));
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Error",
            body: "No se pudo guardar la información de experiencia.",
            id: 2,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } finally {
      setSaving(false);
    }
  };

  const isExpFieldDisabled = (field: keyof ExperienciaLaboral, hasId: boolean) => {
    if (!hasId) return false;
    const nonUpdatableFields: (keyof ExperienciaLaboral)[] = [
      "tipoEntidad",
      "nombreEntidad",
      "pais",
      "departamento",
      "municipio",
      "direccionEntidad",
      "dependencia",
      "nivelJerarquiaEmpleo",
      "cargo",
      "trabajoActual",
      "fechaIngreso",
      "jornadaLaboral",
      "tiempoExperiencia",
    ];
    return nonUpdatableFields.includes(field);
  };

  const isDocenteFieldDisabled = (field: keyof ExperienciaLaboralDocente, hasId: boolean) => {
    if (!hasId) return false;
    const nonUpdatableFields: (keyof ExperienciaLaboralDocente)[] = [
      "tipoInstitucion",
      "nombreInstitucion",
      "pais",
      "departamento",
      "municipio",
      "nivelAcademico",
      "areaConocimiento",
      "tipoZona",
      "trabajoActual",
      "fechaIngreso",
      "jornadaLaboral",
      "tiempoExperiencia",
    ];
    return nonUpdatableFields.includes(field);
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Experiencia Laboral</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {loading && (
              <IonText color="medium">
                <p>Cargando experiencia guardada...</p>
              </IonText>
          )}
          <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
          <IonToast isOpen={saved} message="✅ Información guardada correctamente." duration={3000} onDidDismiss={() => setSaved(false)} />

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {["Experiencia General", "Experiencia Docente"].map((t, i) => (
                <IonButton key={t} fill={tab === i ? "solid" : "outline"} onClick={() => setTab(i)} disabled={saving}>
                  {t}
                </IonButton>
            ))}
          </div>

          <form onSubmit={handleSave}>
            {tab === 0 && (
                <>
                  <IonText color="medium">
                    <p>Puede agregar varias experiencias laborales. Para cambiar una experiencia ya guardada, solo puede modificar teléfono, fecha de retiro (si aplica), horas promedio, motivo de retiro, certificado y su verificación.</p>
                  </IonText>
                  {exps.map((exp, i) => {
                    const hasId = !!exp.id;
                    const isDisabled = (field: keyof ExperienciaLaboral) => isExpFieldDisabled(field, hasId);
                    return (
                        <div key={exp.id ?? exp.clientId ?? i} style={{ marginBottom: "24px", border: "1px solid var(--ion-color-medium)", borderRadius: "8px", padding: "12px" }}>
                          <h3>
                            Empleo #{i + 1} {hasId ? "(existente)" : "(nuevo)"}
                            {hasId ? null : exps.length > 1 && (
                                <IonButton fill="clear" color="danger" onClick={() => setExps((p) => p.filter((_, idx) => idx !== i))}>
                                  Quitar
                                </IonButton>
                            )}
                          </h3>
                          <IonItem>
                            <IonLabel position="stacked">Tipo de entidad *</IonLabel>
                            <IonSelect required disabled={isDisabled("tipoEntidad")} value={exp.tipoEntidad} onIonChange={(e) => updateExp(i, "tipoEntidad", e.detail.value)}>
                              {Object.entries(TipoEntidadLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Nombre entidad *</IonLabel>
                            <IonInput required disabled={isDisabled("nombreEntidad")} value={exp.nombreEntidad} onIonChange={(e) => updateExp(i, "nombreEntidad", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">País *</IonLabel>
                            <IonInput required disabled={isDisabled("pais")} value={exp.pais} onIonChange={(e) => updateExp(i, "pais", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Departamento *</IonLabel>
                            <IonInput required disabled={isDisabled("departamento")} value={exp.departamento} onIonChange={(e) => updateExp(i, "departamento", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Municipio *</IonLabel>
                            <IonInput required disabled={isDisabled("municipio")} value={exp.municipio} onIonChange={(e) => updateExp(i, "municipio", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Dirección entidad *</IonLabel>
                            <IonInput required disabled={isDisabled("direccionEntidad")} value={exp.direccionEntidad} onIonChange={(e) => updateExp(i, "direccionEntidad", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Teléfono entidad</IonLabel>
                            <IonInput value={exp.telefono ?? ""} onIonChange={(e) => updateExp(i, "telefono", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Cargo *</IonLabel>
                            <IonInput required disabled={isDisabled("cargo")} value={exp.cargo} onIonChange={(e) => updateExp(i, "cargo", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Nivel jerárquico *</IonLabel>
                            <IonSelect required disabled={isDisabled("nivelJerarquiaEmpleo")} value={exp.nivelJerarquiaEmpleo} onIonChange={(e) => updateExp(i, "nivelJerarquiaEmpleo", e.detail.value)}>
                              {Object.entries(NivelJerarquicoEmpleoLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Dependencia *</IonLabel>
                            <IonInput required disabled={isDisabled("dependencia")} value={exp.dependencia} onIonChange={(e) => updateExp(i, "dependencia", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Fecha ingreso *</IonLabel>
                            <IonInput type="date" required disabled={isDisabled("fechaIngreso")} value={exp.fechaIngreso} onIonChange={(e) => updateExp(i, "fechaIngreso", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">¿Trabajo actual? *</IonLabel>
                            <IonSelect required disabled={isDisabled("trabajoActual")} value={String(exp.trabajoActual)} onIonChange={(e) => updateExp(i, "trabajoActual", e.detail.value === "true")}>
                              <IonSelectOption value="false">No</IonSelectOption>
                              <IonSelectOption value="true">Sí</IonSelectOption>
                            </IonSelect>
                          </IonItem>
                          {!exp.trabajoActual && (
                              <IonItem>
                                <IonLabel position="stacked">Fecha retiro</IonLabel>
                                <IonInput type="date" value={exp.fechaRetiro ?? ""} onIonChange={(e) => updateExp(i, "fechaRetiro", e.detail.value!)} />
                              </IonItem>
                          )}
                          <IonItem>
                            <IonLabel position="stacked">Jornada laboral *</IonLabel>
                            <IonSelect required disabled={isDisabled("jornadaLaboral")} value={exp.jornadaLaboral} onIonChange={(e) => updateExp(i, "jornadaLaboral", e.detail.value)}>
                              {Object.entries(JornadaLaboralLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Horas promedio / mes</IonLabel>
                            <IonInput type="number" value={exp.horasPromedioMes} onIonChange={(e) => updateExp(i, "horasPromedioMes", Number(e.detail.value))} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Tiempo experiencia *</IonLabel>
                            <IonInput type="number" required disabled={isDisabled("tiempoExperiencia")} value={exp.tiempoExperiencia} onIonChange={(e) => updateExp(i, "tiempoExperiencia", Number(e.detail.value))} />
                          </IonItem>
                          {!exp.trabajoActual && (
                              <IonItem>
                                <IonLabel position="stacked">Motivo retiro</IonLabel>
                                <IonInput value={exp.motivoRetiro ?? ""} onIonChange={(e) => updateExp(i, "motivoRetiro", e.detail.value!)} />
                              </IonItem>
                          )}
                          <FileUploadField label="Certificado laboral" value={exp.certificadoLaboral} onChange={(url) => updateExp(i, "certificadoLaboral", url)} />
                          <IonItem lines="none">
                            <IonCheckbox checked={exp.documentoVerificado} onIonChange={(e) => updateExp(i, "documentoVerificado", e.detail.checked)}>
                              <IonLabel>Certificado verificado</IonLabel>
                            </IonCheckbox>
                          </IonItem>
                        </div>
                    );
                  })}
                  <IonButton expand="block" onClick={() => setExps((p) => [...p, emptyExp()])}>
                    + Agregar otra experiencia
                  </IonButton>
                </>
            )}

            {tab === 1 && (
                <>
                  <IonText color="medium">
                    <p>Puede agregar varias experiencias docentes. Para cambiar una experiencia ya guardada, solo puede modificar fecha de terminación (si aplica), horas promedio, motivo de retiro, teléfono, materia impartida, certificado y su verificación.</p>
                  </IonText>
                  {docentes.length === 0 && <IonText color="medium"><p>No ha registrado experiencia docente.</p></IonText>}
                  {docentes.map((doc, i) => {
                    const hasId = !!doc.id;
                    const isDisabled = (field: keyof ExperienciaLaboralDocente) => isDocenteFieldDisabled(field, hasId);
                    return (
                        <div key={doc.id ?? doc.clientId ?? i} style={{ marginBottom: "24px", border: "1px solid var(--ion-color-medium)", borderRadius: "8px", padding: "12px" }}>
                          <h3>
                            Docencia #{i + 1} {hasId ? "(existente)" : "(nuevo)"}
                            {hasId ? null : <IonButton fill="clear" color="danger" onClick={() => setDocentes((p) => p.filter((_, idx) => idx !== i))}>Quitar</IonButton>}
                          </h3>
                          <IonItem>
                            <IonLabel position="stacked">Tipo institución *</IonLabel>
                            <IonSelect required disabled={isDisabled("tipoInstitucion")} value={doc.tipoInstitucion} onIonChange={(e) => updateDocente(i, "tipoInstitucion", e.detail.value)}>
                              {Object.entries(TipoInstitucionLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Nombre institución *</IonLabel>
                            <IonInput required disabled={isDisabled("nombreInstitucion")} value={doc.nombreInstitucion} onIonChange={(e) => updateDocente(i, "nombreInstitucion", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">País *</IonLabel>
                            <IonInput required disabled={isDisabled("pais")} value={doc.pais} onIonChange={(e) => updateDocente(i, "pais", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Departamento *</IonLabel>
                            <IonInput required disabled={isDisabled("departamento")} value={doc.departamento} onIonChange={(e) => updateDocente(i, "departamento", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Municipio *</IonLabel>
                            <IonInput required disabled={isDisabled("municipio")} value={doc.municipio} onIonChange={(e) => updateDocente(i, "municipio", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Nivel académico *</IonLabel>
                            <IonSelect required disabled={isDisabled("nivelAcademico")} value={doc.nivelAcademico} onIonChange={(e) => updateDocente(i, "nivelAcademico", e.detail.value)}>
                              {Object.entries(NivelAcademicoLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Área conocimiento *</IonLabel>
                            <IonSelect required disabled={isDisabled("areaConocimiento")} value={doc.areaConocimiento} onIonChange={(e) => updateDocente(i, "areaConocimiento", e.detail.value)}>
                              {Object.entries(AreaConocimientoLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Materia impartida</IonLabel>
                            <IonInput value={doc.materiaImpartida ?? ""} onIonChange={(e) => updateDocente(i, "materiaImpartida", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Fecha ingreso *</IonLabel>
                            <IonInput type="date" required disabled={isDisabled("fechaIngreso")} value={doc.fechaIngreso} onIonChange={(e) => updateDocente(i, "fechaIngreso", e.detail.value!)} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">¿Trabajo actual? *</IonLabel>
                            <IonSelect required disabled={isDisabled("trabajoActual")} value={String(doc.trabajoActual)} onIonChange={(e) => updateDocente(i, "trabajoActual", e.detail.value === "true")}>
                              <IonSelectOption value="false">No</IonSelectOption>
                              <IonSelectOption value="true">Sí</IonSelectOption>
                            </IonSelect>
                          </IonItem>
                          {!doc.trabajoActual && (
                              <IonItem>
                                <IonLabel position="stacked">Fecha terminación</IonLabel>
                                <IonInput type="date" value={doc.fechaTerminacion ?? ""} onIonChange={(e) => updateDocente(i, "fechaTerminacion", e.detail.value!)} />
                              </IonItem>
                          )}
                          <IonItem>
                            <IonLabel position="stacked">Tipo zona *</IonLabel>
                            <IonSelect required disabled={isDisabled("tipoZona")} value={doc.tipoZona} onIonChange={(e) => updateDocente(i, "tipoZona", e.detail.value)}>
                              {Object.entries(TipoZonaLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Jornada laboral *</IonLabel>
                            <IonSelect required disabled={isDisabled("jornadaLaboral")} value={doc.jornadaLaboral} onIonChange={(e) => updateDocente(i, "jornadaLaboral", e.detail.value)}>
                              {Object.entries(JornadaLaboralLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                            </IonSelect>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Horas promedio / mes</IonLabel>
                            <IonInput type="number" value={doc.horasPromedioMes} onIonChange={(e) => updateDocente(i, "horasPromedioMes", Number(e.detail.value))} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Tiempo experiencia *</IonLabel>
                            <IonInput type="number" required disabled={isDisabled("tiempoExperiencia")} value={doc.tiempoExperiencia} onIonChange={(e) => updateDocente(i, "tiempoExperiencia", Number(e.detail.value))} />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="stacked">Teléfono</IonLabel>
                            <IonInput value={doc.telefono ?? ""} onIonChange={(e) => updateDocente(i, "telefono", e.detail.value!)} />
                          </IonItem>
                          {!doc.trabajoActual && (
                              <IonItem>
                                <IonLabel position="stacked">Motivo retiro</IonLabel>
                                <IonInput value={doc.motivoRetiro ?? ""} onIonChange={(e) => updateDocente(i, "motivoRetiro", e.detail.value!)} />
                              </IonItem>
                          )}
                          <FileUploadField label="Certificado laboral" value={doc.certificadoLaboral} onChange={(url) => updateDocente(i, "certificadoLaboral", url)} />
                          <IonItem lines="none">
                            <IonCheckbox checked={doc.documentoVerificado} onIonChange={(e) => updateDocente(i, "documentoVerificado", e.detail.checked)}>
                              <IonLabel>Certificado verificado</IonLabel>
                            </IonCheckbox>
                          </IonItem>
                        </div>
                    );
                  })}
                  <IonButton expand="block" onClick={() => setDocentes((p) => [...p, emptyDocente()])}>
                    + Agregar experiencia docente
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

export default ExperienciaPage;