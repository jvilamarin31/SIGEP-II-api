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
  IonText,
  IonSpinner,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { Haptics } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { curriculumService, getApiError } from "../../services/api";
import {
  addDateNotFutureError,
  addDateOrderError,
  addRequiredDateError,
  addRequiredTextError,
  joinValidationErrors,
} from "../../utils/curriculumValidation";
import {
  ArticuloPublicacion,
  LibroResultadoInvestigacion,
  TipoPremioReconocimiento,
  TipoProduccionBibliografica,
} from "../../types";

const articuloLabels: Record<ArticuloPublicacion, string> = {
  [ArticuloPublicacion.Libro]: "Libro",
  [ArticuloPublicacion.RevistaIndexada]: "Revista indexada",
  [ArticuloPublicacion.RevistaNoIndexada]: "Revista no indexada",
};

const libroLabels: Record<LibroResultadoInvestigacion, string> = {
  [LibroResultadoInvestigacion.ArticuloRevista]: "Artículo de revista",
  [LibroResultadoInvestigacion.CapituloLibro]: "Capítulo en libro resultado de investigación",
  [LibroResultadoInvestigacion.LibroCompleto]: "Libro completo resultado de investigación",
};

const produccionLabels: Record<TipoProduccionBibliografica, string> = {
  [TipoProduccionBibliografica.DocumentoTrabajo]: "Documento de trabajo",
  [TipoProduccionBibliografica.Otro]: "Otro",
  [TipoProduccionBibliografica.Traduccion]: "Traducción",
};

const premioLabels: Record<TipoPremioReconocimiento, string> = {
  [TipoPremioReconocimiento.Premio]: "Premio",
  [TipoPremioReconocimiento.Reconocimiento]: "Reconocimiento",
};

const tabs = ["Publicación", "Premio / Reconocimiento", "Proyecto", "Corporación / Entidad"];

const DetailItem: React.FC<{ item: Record<string, unknown>; type: string }> = ({ item, type }) => {
  if (type === "Publicación") {
    return (
        <div style={{ borderBottom: "1px solid var(--ion-color-medium)", padding: "8px 0" }}>
          <strong>{String(item.nombrePublicacion ?? "Sin nombre")}</strong>
          <div style={{ fontSize: "0.9rem" }}>
            <span>📄 {String(item.articulo ? articuloLabels[item.articulo as ArticuloPublicacion] : "-")}</span>{" "}
            <span>📖 {String(item.nombreLibroRevista ?? "-")}</span>{" "}
            <span>🏷️ {String(item.tiposProduccionBibliografica ? produccionLabels[item.tiposProduccionBibliografica as TipoProduccionBibliografica] : "-")}</span>
          </div>
        </div>
    );
  }
  if (type === "Premio / Reconocimiento") {
    return (
        <div style={{ borderBottom: "1px solid var(--ion-color-medium)", padding: "8px 0" }}>
          <strong>{String(item.nombreEntidadOrganizacion ?? "Sin nombre")}</strong>
          <div style={{ fontSize: "0.9rem" }}>
            <span>🏆 {String(item.tipo ? premioLabels[item.tipo as TipoPremioReconocimiento] : "-")}</span>{" "}
            <span>📅 {String(item.fecha ? new Date(item.fecha as string).toLocaleDateString() : "-")}</span>{" "}
            <span>📍 {String(item.pais ?? "-")} / {String(item.departamento ?? "-")} / {String(item.municipio ?? "-")}</span>
          </div>
        </div>
    );
  }
  if (type === "Proyecto") {
    return (
        <div style={{ borderBottom: "1px solid var(--ion-color-medium)", padding: "8px 0" }}>
          <strong>{String(item.nombre ?? "Sin nombre")}</strong>
          <div style={{ fontSize: "0.9rem" }}>
            <span>👤 {String(item.rolDesempeñado ?? "-")}</span>{" "}
            <span>🏢 {String(item.nombreEntidadOrganizacion ?? "-")}</span>{" "}
            <span>📅 {String(item.fechaInicio ? new Date(item.fechaInicio as string).toLocaleDateString() : "-")} → {String(item.fechaTerminacion ? new Date(item.fechaTerminacion as string).toLocaleDateString() : "-")}</span>{" "}
            <span>📍 {String(item.pais ?? "-")} / {String(item.departamento ?? "-")} / {String(item.municipio ?? "-")}</span>
          </div>
        </div>
    );
  }
  if (type === "Corporación / Entidad") {
    return (
        <div style={{ borderBottom: "1px solid var(--ion-color-medium)", padding: "8px 0" }}>
          <strong>{String(item.nombreCorporacion ?? "Sin nombre")}</strong>
          <div style={{ fontSize: "0.9rem" }}>
            <span>🏛️ {String(item.nombreRazonSocialInstitucion ?? "-")}</span>{" "}
            <span>🤝 {String(item.nombreEntidadOrganizacion ?? "-")}</span>
          </div>
        </div>
    );
  }
  return <div style={{ padding: "8px 0" }}>{String(item.id ?? "Registro")}</div>;
};

const GerenciaPublicaPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [personaExpuesta, setPersonaExpuesta] = useState<boolean | null>(null);

  const [listados, setListados] = useState({
    publicaciones: [] as Record<string, unknown>[],
    premios: [] as Record<string, unknown>[],
    proyectos: [] as Record<string, unknown>[],
    corporaciones: [] as Record<string, unknown>[],
  });

  const [publicacion, setPublicacion] = useState({
    articulo: ArticuloPublicacion.Libro,
    nombreArticulo: "",
    libroResultadoInvestigacion: LibroResultadoInvestigacion.LibroCompleto,
    nombreLibroRevista: "",
    tiposProduccionBibliografica: TipoProduccionBibliografica.DocumentoTrabajo,
    nombrePublicacion: "",
  });

  const [premio, setPremio] = useState({
    tipo: TipoPremioReconocimiento.Premio,
    nombreEntidadOrganizacion: "",
    fecha: "",
    pais: "Colombia",
    departamento: "",
    municipio: "",
  });

  const [proyecto, setProyecto] = useState({
    nombre: "",
    rolDesempeñado: "",
    nombreEntidadOrganizacion: "",
    pais: "Colombia",
    departamento: "",
    municipio: "",
    fechaInicio: "",
    fechaTerminacion: "",
  });

  const [corporacion, setCorporacion] = useState({
    nombreCorporacion: "",
    nombreRazonSocialInstitucion: "",
    nombreEntidadOrganizacion: "",
  });

  useEffect(() => {
    const cargarFlag = async () => {
      try {
        const datosBasicos = await curriculumService.obtenerDatosBasicos();
        setPersonaExpuesta(datosBasicos?.personaExpuestaPoliticamente ?? false);
      } catch (err) {
        console.error("No se pudo obtener el estado de persona expuesta políticamente", err);
        setPersonaExpuesta(false);
      } finally {
        await cargarListados();
      }
    };
    cargarFlag();
  }, []);

  const cargarListados = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    const [publicaciones, premios, proyectos, corporaciones] = await Promise.allSettled([
      curriculumService.obtenerPublicaciones(),
      curriculumService.obtenerPremiosReconocimientos(),
      curriculumService.obtenerParticipacionesProyectos(),
      curriculumService.obtenerParticipacionesCorporaciones(),
    ]);

    setListados({
      publicaciones: publicaciones.status === "fulfilled" && Array.isArray(publicaciones.value) ? publicaciones.value : [],
      premios: premios.status === "fulfilled" && Array.isArray(premios.value) ? premios.value : [],
      proyectos: proyectos.status === "fulfilled" && Array.isArray(proyectos.value) ? proyectos.value : [],
      corporaciones: corporaciones.status === "fulfilled" && Array.isArray(corporaciones.value) ? corporaciones.value : [],
    });

    if (!silent) setLoading(false);
  }, []);

  const showSuccess = async () => {
    setSaved(true);
    await Haptics.vibrate();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Registro guardado",
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
      addRequiredTextError(errors, publicacion.nombreArticulo, "Nombre del artículo");
      addRequiredTextError(errors, publicacion.nombreLibroRevista, "Libro o revista");
      addRequiredTextError(errors, publicacion.nombrePublicacion, "Nombre de la publicación");
    }

    if (tab === 1) {
      addRequiredTextError(errors, premio.nombreEntidadOrganizacion, "Entidad u organización");
      addRequiredDateError(errors, premio.fecha, "Fecha del premio o reconocimiento");
      addDateNotFutureError(errors, premio.fecha, "Fecha del premio o reconocimiento");
      addRequiredTextError(errors, premio.pais, "País");
      addRequiredTextError(errors, premio.departamento, "Departamento");
      addRequiredTextError(errors, premio.municipio, "Municipio");
    }

    if (tab === 2) {
      addRequiredTextError(errors, proyecto.nombre, "Nombre del proyecto");
      addRequiredTextError(errors, proyecto.rolDesempeñado, "Rol desempeñado");
      addRequiredTextError(errors, proyecto.nombreEntidadOrganizacion, "Entidad u organización");
      addRequiredTextError(errors, proyecto.pais, "País");
      addRequiredTextError(errors, proyecto.departamento, "Departamento");
      addRequiredTextError(errors, proyecto.municipio, "Municipio");
      addRequiredDateError(errors, proyecto.fechaInicio, "Fecha de inicio del proyecto");
      addRequiredDateError(errors, proyecto.fechaTerminacion, "Fecha de terminación del proyecto");
      addDateNotFutureError(errors, proyecto.fechaInicio, "Fecha de inicio del proyecto");
      addDateNotFutureError(errors, proyecto.fechaTerminacion, "Fecha de terminación del proyecto");
      addDateOrderError(errors, proyecto.fechaInicio, proyecto.fechaTerminacion, "La fecha de terminación del proyecto no puede ser anterior a la fecha de inicio.");
    }

    if (tab === 3) {
      addRequiredTextError(errors, corporacion.nombreCorporacion, "Nombre de la corporación");
      addRequiredTextError(errors, corporacion.nombreRazonSocialInstitucion, "Razón social de la institución");
      addRequiredTextError(errors, corporacion.nombreEntidadOrganizacion, "Entidad u organización");
    }

    return errors;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (personaExpuesta !== true) {
      setError("No tienes permiso para registrar información de gerencia pública.");
      return;
    }

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
        await curriculumService.registrarPublicacion({
          ...publicacion,
          nombreArticulo: publicacion.nombreArticulo.trim(),
          nombreLibroRevista: publicacion.nombreLibroRevista.trim(),
          nombrePublicacion: publicacion.nombrePublicacion.trim(),
        });
      }

      if (tab === 1) {
        await curriculumService.registrarPremioReconocimiento({
          ...premio,
          nombreEntidadOrganizacion: premio.nombreEntidadOrganizacion.trim(),
          pais: premio.pais.trim(),
          departamento: premio.departamento.trim(),
          municipio: premio.municipio.trim(),
        });
      }

      if (tab === 2) {
        await curriculumService.registrarParticipacionProyecto({
          ...proyecto,
          nombre: proyecto.nombre.trim(),
          rolDesempeñado: proyecto.rolDesempeñado.trim(),
          nombreEntidadOrganizacion: proyecto.nombreEntidadOrganizacion.trim(),
          pais: proyecto.pais.trim(),
          departamento: proyecto.departamento.trim(),
          municipio: proyecto.municipio.trim(),
        });
      }

      if (tab === 3) {
        await curriculumService.registrarParticipacionCorporacionEntidad({
          nombreCorporacion: corporacion.nombreCorporacion.trim(),
          nombreRazonSocialInstitucion: corporacion.nombreRazonSocialInstitucion.trim(),
          nombreEntidadOrganizacion: corporacion.nombreEntidadOrganizacion.trim(),
        });
      }

      await cargarListados(true);
      await showSuccess();
      // Limpiar formulario después de guardar
      if (tab === 0) setPublicacion({
        articulo: ArticuloPublicacion.Libro,
        nombreArticulo: "",
        libroResultadoInvestigacion: LibroResultadoInvestigacion.LibroCompleto,
        nombreLibroRevista: "",
        tiposProduccionBibliografica: TipoProduccionBibliografica.DocumentoTrabajo,
        nombrePublicacion: "",
      });
      if (tab === 1) setPremio({
        tipo: TipoPremioReconocimiento.Premio,
        nombreEntidadOrganizacion: "",
        fecha: "",
        pais: "Colombia",
        departamento: "",
        municipio: "",
      });
      if (tab === 2) setProyecto({
        nombre: "",
        rolDesempeñado: "",
        nombreEntidadOrganizacion: "",
        pais: "Colombia",
        departamento: "",
        municipio: "",
        fechaInicio: "",
        fechaTerminacion: "",
      });
      if (tab === 3) setCorporacion({
        nombreCorporacion: "",
        nombreRazonSocialInstitucion: "",
        nombreEntidadOrganizacion: "",
      });
    } catch (err) {
      setError(getApiError(err));
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Error",
            body: "No se pudo guardar el registro.",
            id: 2,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } finally {
      setSaving(false);
    }
  };

  const listaActual = [listados.publicaciones, listados.premios, listados.proyectos, listados.corporaciones][tab];
  const currentTabName = tabs[tab];

  if (personaExpuesta === null && loading) {
    return (
        <IonPage>
          <IonHeader><IonToolbar><IonTitle>Gerencia Pública</IonTitle></IonToolbar></IonHeader>
          <IonContent className="ion-padding">
            <IonText color="medium"><p>Verificando permisos...</p></IonText>
          </IonContent>
        </IonPage>
    );
  }

  if (personaExpuesta !== true) {
    return (
        <IonPage>
          <IonHeader><IonToolbar><IonTitle>Gerencia Pública</IonTitle></IonToolbar></IonHeader>
          <IonContent className="ion-padding">
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
              <h3>Acceso restringido</h3>
              <p>Para registrar información en esta sección debes marcar la casilla <strong>“Persona expuesta políticamente”</strong> en Datos Personales → Datos Básicos.</p>
              <IonButton routerLink="/curriculum/datos-personales" expand="block">
                Ir a Datos Personales
              </IonButton>
            </div>
          </IonContent>
        </IonPage>
    );
  }

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Gerencia Pública</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {loading && <IonText color="medium"><p>Cargando registros guardados...</p></IonText>}
          <IonAlert isOpen={!!error} message={error} buttons={["OK"]} onDidDismiss={() => setError("")} />
          <IonToast isOpen={saved} message="✅ Registro guardado correctamente." duration={3000} onDidDismiss={() => setSaved(false)} />

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {tabs.map((item, i) => (
                <IonButton key={item} fill={tab === i ? "solid" : "outline"} onClick={() => setTab(i)} disabled={saving}>
                  {item}
                </IonButton>
            ))}
          </div>

          <div style={{ marginBottom: "24px", border: "1px solid var(--ion-color-medium)", borderRadius: "8px", padding: "12px" }}>
            <strong>Registros existentes:</strong>
            {listaActual.length === 0 ? (
                <p className="text-muted" style={{ marginTop: 8 }}>No hay registros guardados para esta sección.</p>
            ) : (
                <div style={{ marginTop: 12 }}>
                  {listaActual.map((item, index) => (
                      <DetailItem key={item.id as string ?? index} item={item} type={currentTabName} />
                  ))}
                </div>
            )}
          </div>

          <form onSubmit={handleSave}>
            {tab === 0 && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Artículo *</IonLabel>
                    <IonSelect required value={publicacion.articulo} onIonChange={(e) => setPublicacion(p => ({ ...p, articulo: e.detail.value }))}>
                      {Object.entries(articuloLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Nombre artículo *</IonLabel>
                    <IonInput required value={publicacion.nombreArticulo} onIonChange={(e) => setPublicacion(p => ({ ...p, nombreArticulo: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Resultado investigación *</IonLabel>
                    <IonSelect required value={publicacion.libroResultadoInvestigacion} onIonChange={(e) => setPublicacion(p => ({ ...p, libroResultadoInvestigacion: e.detail.value }))}>
                      {Object.entries(libroLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Libro / revista *</IonLabel>
                    <IonInput required value={publicacion.nombreLibroRevista} onIonChange={(e) => setPublicacion(p => ({ ...p, nombreLibroRevista: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Tipo producción *</IonLabel>
                    <IonSelect required value={publicacion.tiposProduccionBibliografica} onIonChange={(e) => setPublicacion(p => ({ ...p, tiposProduccionBibliografica: e.detail.value }))}>
                      {Object.entries(produccionLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Nombre publicación *</IonLabel>
                    <IonInput required value={publicacion.nombrePublicacion} onIonChange={(e) => setPublicacion(p => ({ ...p, nombrePublicacion: e.detail.value! }))} />
                  </IonItem>
                </>
            )}

            {tab === 1 && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Tipo *</IonLabel>
                    <IonSelect required value={premio.tipo} onIonChange={(e) => setPremio(p => ({ ...p, tipo: e.detail.value }))}>
                      {Object.entries(premioLabels).map(([val, label]) => <IonSelectOption key={val} value={val}>{label}</IonSelectOption>)}
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Entidad / organización *</IonLabel>
                    <IonInput required value={premio.nombreEntidadOrganizacion} onIonChange={(e) => setPremio(p => ({ ...p, nombreEntidadOrganizacion: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Fecha *</IonLabel>
                    <IonInput type="date" required value={premio.fecha} onIonChange={(e) => setPremio(p => ({ ...p, fecha: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">País *</IonLabel>
                    <IonInput required value={premio.pais} onIonChange={(e) => setPremio(p => ({ ...p, pais: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Departamento *</IonLabel>
                    <IonInput required value={premio.departamento} onIonChange={(e) => setPremio(p => ({ ...p, departamento: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Municipio *</IonLabel>
                    <IonInput required value={premio.municipio} onIonChange={(e) => setPremio(p => ({ ...p, municipio: e.detail.value! }))} />
                  </IonItem>
                </>
            )}

            {tab === 2 && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Nombre *</IonLabel>
                    <IonInput required value={proyecto.nombre} onIonChange={(e) => setProyecto(p => ({ ...p, nombre: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Rol desempeñado *</IonLabel>
                    <IonInput required value={proyecto.rolDesempeñado} onIonChange={(e) => setProyecto(p => ({ ...p, rolDesempeñado: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Entidad / organización *</IonLabel>
                    <IonInput required value={proyecto.nombreEntidadOrganizacion} onIonChange={(e) => setProyecto(p => ({ ...p, nombreEntidadOrganizacion: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">País *</IonLabel>
                    <IonInput required value={proyecto.pais} onIonChange={(e) => setProyecto(p => ({ ...p, pais: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Departamento *</IonLabel>
                    <IonInput required value={proyecto.departamento} onIonChange={(e) => setProyecto(p => ({ ...p, departamento: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Municipio *</IonLabel>
                    <IonInput required value={proyecto.municipio} onIonChange={(e) => setProyecto(p => ({ ...p, municipio: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Fecha inicio *</IonLabel>
                    <IonInput type="date" required value={proyecto.fechaInicio} onIonChange={(e) => setProyecto(p => ({ ...p, fechaInicio: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Fecha terminación *</IonLabel>
                    <IonInput type="date" required value={proyecto.fechaTerminacion} onIonChange={(e) => setProyecto(p => ({ ...p, fechaTerminacion: e.detail.value! }))} />
                  </IonItem>
                </>
            )}

            {tab === 3 && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Nombre corporación *</IonLabel>
                    <IonInput required value={corporacion.nombreCorporacion} onIonChange={(e) => setCorporacion(p => ({ ...p, nombreCorporacion: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Razón social institución *</IonLabel>
                    <IonInput required value={corporacion.nombreRazonSocialInstitucion} onIonChange={(e) => setCorporacion(p => ({ ...p, nombreRazonSocialInstitucion: e.detail.value! }))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Entidad / organización *</IonLabel>
                    <IonInput required value={corporacion.nombreEntidadOrganizacion} onIonChange={(e) => setCorporacion(p => ({ ...p, nombreEntidadOrganizacion: e.detail.value! }))} />
                  </IonItem>
                </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              <IonButton disabled={tab === 0 || saving} onClick={() => setTab(tab - 1)} fill="outline">
                ← Anterior
              </IonButton>
              <div style={{ display: "flex", gap: "8px" }}>
                <IonButton type="submit" disabled={saving}>
                  {saving ? <IonSpinner name="crescent" /> : "✓ Crear registro"}
                </IonButton>
                {tab < tabs.length - 1 && (
                    <IonButton onClick={() => setTab(tab + 1)} disabled={saving}>
                      Siguiente →
                    </IonButton>
                )}
              </div>
            </div>
          </form>
        </IonContent>
      </IonPage>
  );
};

export default GerenciaPublicaPage;