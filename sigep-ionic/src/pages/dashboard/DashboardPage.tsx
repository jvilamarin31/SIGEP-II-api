import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonIcon,
  IonText,
  IonToast,
  IonAlert,
} from "@ionic/react";
import { documentTextOutline, checkmarkCircleOutline, alertCircleOutline } from "ionicons/icons";
import { useAuth } from "../../hooks/useAuth";
import { curriculumService, getApiError } from "../../services/api";
import { Haptics } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";

type SectionKey = "datosPersonales" | "educacion" | "experiencia" | "gerenciaPublica";

type SectionStatus = {
  loading: boolean;
  completed: boolean;
};

const initialSectionStatus: Record<SectionKey, SectionStatus> = {
  datosPersonales: { loading: true, completed: false },
  educacion: { loading: true, completed: false },
  experiencia: { loading: true, completed: false },
  gerenciaPublica: { loading: true, completed: false },
};

const isFulfilled = <T,>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> =>
    result.status === "fulfilled";

const hasItems = (value: unknown): boolean => Array.isArray(value) && value.length > 0;

const countFiles = (data: unknown): number => {
  if (data === null || data === undefined) return 0;
  if (typeof data === "string") {
    if (data.trim().length > 0 && (data.includes("/") || data.includes("."))) return 1;
    return 0;
  }
  if (Array.isArray(data)) {
    return data.reduce((sum, item) => sum + countFiles(item), 0);
  }
  if (typeof data === "object") {
    return Object.values(data).reduce((sum, val) => sum + countFiles(val), 0);
  }
  return 0;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [sectionStatus, setSectionStatus] = useState<Record<SectionKey, SectionStatus>>(initialSectionStatus);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [totalFiles, setTotalFiles] = useState(0);
  const [showPdfToast, setShowPdfToast] = useState(false);
  const [showPdfAlert, setShowPdfAlert] = useState(false);
  const [pdfAlertMsg, setPdfAlertMsg] = useState("");

  useEffect(() => {
    let active = true;

    const loadSectionStatus = async () => {
      const [datosBasicos, datosDemograficos, datosContacto] = await Promise.allSettled([
        curriculumService.obtenerDatosBasicos(),
        curriculumService.obtenerDatosDemograficos(),
        curriculumService.obtenerDatosContacto(),
      ]);

      const [formaciones, educacionesTrabajo, idiomas] = await Promise.allSettled([
        curriculumService.obtenerFormacionesAcademicas(),
        curriculumService.obtenerEducacionesTrabajo(),
        curriculumService.obtenerIdiomas(),
      ]);

      const [experienciasLaborales, experienciasDocentes] = await Promise.allSettled([
        curriculumService.obtenerExperienciasLaborales(),
        curriculumService.obtenerExperienciasDocentes(),
      ]);

      const [publicaciones, premios, proyectos, corporaciones] = await Promise.allSettled([
        curriculumService.obtenerPublicaciones(),
        curriculumService.obtenerPremiosReconocimientos(),
        curriculumService.obtenerParticipacionesProyectos(),
        curriculumService.obtenerParticipacionesCorporaciones(),
      ]);

      const allData = {
        datosBasicos: isFulfilled(datosBasicos) ? datosBasicos.value : null,
        datosDemograficos: isFulfilled(datosDemograficos) ? datosDemograficos.value : null,
        datosContacto: isFulfilled(datosContacto) ? datosContacto.value : null,
        educacion: {
          formacionesAcademicas: isFulfilled(formaciones) ? formaciones.value : [],
          educacionTrabajos: isFulfilled(educacionesTrabajo) ? educacionesTrabajo.value : [],
          idiomas: isFulfilled(idiomas) ? idiomas.value : [],
        },
        experienciasLaborales: isFulfilled(experienciasLaborales) ? experienciasLaborales.value : [],
        experienciasDocentes: isFulfilled(experienciasDocentes) ? experienciasDocentes.value : [],
        gerenciaPublica: {
          publicaciones: isFulfilled(publicaciones) ? publicaciones.value : [],
          premios: isFulfilled(premios) ? premios.value : [],
          proyectos: isFulfilled(proyectos) ? proyectos.value : [],
          corporaciones: isFulfilled(corporaciones) ? corporaciones.value : [],
        },
      };

      const filesCount = countFiles(allData);
      setTotalFiles(filesCount);

      if (!active) return;

      setSectionStatus({
        datosPersonales: {
          loading: false,
          completed: [datosBasicos, datosDemograficos, datosContacto].every(isFulfilled),
        },
        educacion: {
          loading: false,
          completed: [formaciones, educacionesTrabajo, idiomas]
              .filter(isFulfilled)
              .some((response) => hasItems(response.value)),
        },
        experiencia: {
          loading: false,
          completed: [experienciasLaborales, experienciasDocentes]
              .filter(isFulfilled)
              .some((response) => hasItems(response.value)),
        },
        gerenciaPublica: {
          loading: false,
          completed: [publicaciones, premios, proyectos, corporaciones]
              .filter(isFulfilled)
              .some((response) => hasItems(response.value)),
        },
      });
    };

    loadSectionStatus();
    return () => {
      active = false;
    };
  }, []);

  const sections = useMemo(
      () => [
        {
          key: "datosPersonales" as const,
          title: "Datos Personales",
          desc: "Información básica, demográfica y de contacto.",
          icon: "👤",
          path: "/curriculum/datos-personales",
        },
        {
          key: "educacion" as const,
          title: "Educación",
          desc: "Formación académica, estudios de posgrado e idiomas.",
          icon: "🎓",
          path: "/curriculum/educacion",
        },
        {
          key: "experiencia" as const,
          title: "Experiencia Laboral",
          desc: "Historial de empleos en sector público y privado.",
          icon: "💼",
          path: "/curriculum/experiencia",
        },
        {
          key: "gerenciaPublica" as const,
          title: "Gerencia Pública",
          desc: "Publicaciones, reconocimientos, proyectos y participación institucional.",
          icon: "🏛️",
          path: "/curriculum/gerencia-publica",
        },
      ],
      []
  );

  const completedSections = sections.filter((section) => sectionStatus[section.key].completed).length;
  const loadingSections = sections.some((section) => sectionStatus[section.key].loading);

  const stats = [
    {
      label: "Secciones Completadas",
      value: loadingSections ? "Cargando..." : `${completedSections} / ${sections.length}`,
      icon: "📋",
      color: "primary",
    },
    { label: "Documentos Adjuntos", value: totalFiles.toString(), icon: "📎", color: "success" },
    { label: "Estado del perfil", value: "Activo", icon: "✅", color: "success" },
  ];

  const handleDownloadPdf = async () => {
    try {
      setPdfError(null);
      setDownloadingPdf(true);
      await curriculumService.descargarHojaVidaPdf();
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "PDF generado",
            body: "La hoja de vida se ha descargado correctamente.",
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
      setShowPdfToast(true);
    } catch (error) {
      const errMsg = getApiError(error);
      setPdfError(errMsg);
      setPdfAlertMsg(errMsg);
      setShowPdfAlert(true);
      await Haptics.vibrate();
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
      <IonContent className="ion-padding">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          <div>
            <h2>Hoja de Vida</h2>
            <p>Bienvenido al Sistema de Gestión del Empleo Público · {user?.numeroIdentificacion}</p>
          </div>
          <IonButton onClick={handleDownloadPdf} disabled={downloadingPdf}>
            {downloadingPdf ? <IonSpinner name="crescent" /> : "Descargar hoja de vida"}
          </IonButton>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {stats.map((stat, idx) => (
              <IonCard key={idx} className="ion-text-center">
                <IonCardContent>
                  <div style={{ fontSize: "2rem" }}>{stat.icon}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stat.value}</div>
                  <div>{stat.label}</div>
                </IonCardContent>
              </IonCard>
          ))}
        </div>

        <h3>Secciones de la Hoja de Vida</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "8px" }}>
          {sections.map((sec) => {
            const status = sectionStatus[sec.key];
            const label = status.loading ? "Verificando..." : status.completed ? "Completo" : "Incompleto";
            const buttonLabel = status.completed ? "Ver sección" : "Completar sección";

            return (
                <IonCard key={sec.path} button onClick={() => history.push(sec.path)}>
                  <IonCardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "2rem" }}>{sec.icon}</span>
                      <IonText color={status.completed ? "success" : "warning"}>{label}</IonText>
                    </div>
                    <IonCardTitle>{sec.title}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{sec.desc}</p>
                    <IonButton fill="clear" size="small" className="ion-margin-top">
                      {buttonLabel} →
                    </IonButton>
                  </IonCardContent>
                </IonCard>
            );
          })}
        </div>

        <IonCard color="light" className="ion-margin-top">
          <IonCardContent style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <IonIcon icon={alertCircleOutline} color="primary" />
            <span>
            Complete todas las secciones de su hoja de vida para participar en convocatorias y procesos de selección del empleo público en Colombia.
          </span>
          </IonCardContent>
        </IonCard>

        <IonToast
            isOpen={showPdfToast}
            message="Hoja de vida descargada correctamente."
            duration={3000}
            onDidDismiss={() => setShowPdfToast(false)}
        />
        <IonAlert
            isOpen={showPdfAlert}
            header="Error"
            message={pdfAlertMsg}
            buttons={["OK"]}
            onDidDismiss={() => setShowPdfAlert(false)}
        />
      </IonContent>
  );
};

export default DashboardPage;