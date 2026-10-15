import { useEffect, useMemo, useState } from "react";
import Paginacion from "../components/Paginacion";
import { paginar } from "../utils/paginacion";
import { obtenerIncidentesEliminados } from "../services/incidentesApi";

const etiquetasPrioridad = { BAJA: "Baja", MEDIA: "Media", ALTA: "Alta", CRITICA: "Crítica" };
const etiquetasEstado = { ABIERTO: "Abierto", EN_PROCESO: "En proceso", CERRADO: "Cerrado" };

const claseBadge = (valor) => `incidente-badge incidente-badge--${String(valor || "").toLowerCase().replaceAll("_", "-")}`;

export default function IncidentesEliminados() {
  const [incidentes, setIncidentes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    obtenerIncidentesEliminados()
      .then((datos) => {
        if (componenteActivo) setIncidentes(datos);
      })
      .catch((err) => {
        if (componenteActivo) setError(err.message);
      })
      .finally(() => {
        if (componenteActivo) setCargando(false);
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  const incidentesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return incidentes;
    return incidentes.filter((incidente) => [
      incidente.id,
      incidente.tituloIncidente,
      incidente.tipo,
      incidente.sistemaAfectado,
      etiquetasPrioridad[incidente.prioridad] || incidente.prioridad,
      etiquetasEstado[incidente.estado] || incidente.estado
    ].some((valor) => String(valor || "").toLowerCase().includes(termino)));
  }, [incidentes, busqueda]);

  const [estadoPagina, setEstadoPagina] = useState({ clave: "", pagina: 1 });
  const claveBusqueda = busqueda.trim().toLowerCase();
  const paginaSolicitada = estadoPagina.clave === claveBusqueda ? estadoPagina.pagina : 1;
  const { pagina, totalPaginas, items: incidentesPagina } = paginar(incidentesFiltrados, paginaSolicitada);

  return (
    <section className="dashboard-records user-records" aria-labelledby="titulo-incidentes-eliminados">
      <div className="dashboard-records__heading user-records__heading">
        <div>
          <h2 id="titulo-incidentes-eliminados">Incidentes eliminados</h2>
          <p>En esta lista aparecen únicamente los incidentes que fueron eliminados.</p>
        </div>
      </div>

      {error && <p className="dashboard-message dashboard-message--error" role="alert">Error: {error}</p>}

      <div className="incidentes-toolbar user-status-toolbar">
        <label className="incidentes-search">
          <span className="visually-hidden">Buscar incidente eliminado</span>
          <input
            className="incidentes-search__input"
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por título, tipo o sistema..."
          />
        </label>
        <span className="user-status-count">
          {incidentesFiltrados.length} {incidentesFiltrados.length === 1 ? "incidente" : "incidentes"}
        </span>
      </div>

      {cargando ? (
        <p className="user-records__status">Cargando incidentes eliminados...</p>
      ) : incidentesFiltrados.length === 0 ? (
        <p className="user-records__status">
          {incidentes.length === 0
            ? "No hay incidentes eliminados."
            : "No hay incidentes eliminados que coincidan con la búsqueda."}
        </p>
      ) : (
        <div className="tabla-incidentes__scroll">
          <table className="tabla-incidentes user-records__table user-status-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Sistema afectado</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Registrado por</th>
                <th>Fecha de registro</th>
                <th>Fecha de eliminación</th>
              </tr>
            </thead>
            <tbody>
              {incidentesPagina.map((incidente) => (
                <tr key={incidente.id}>
                  <td>{incidente.id}</td>
                  <td><strong>{incidente.tituloIncidente || "—"}</strong></td>
                  <td>{incidente.tipo || "—"}</td>
                  <td>{incidente.sistemaAfectado || "—"}</td>
                  <td>
                    <span className={claseBadge(incidente.prioridad)}>
                      {etiquetasPrioridad[incidente.prioridad] || incidente.prioridad || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={claseBadge(incidente.estado)}>
                      {etiquetasEstado[incidente.estado] || incidente.estado || "—"}
                    </span>
                  </td>
                  <td>{`${incidente.usuario?.nombre || ""} ${incidente.usuario?.apellido || ""}`.trim() || "—"}</td>
                  <td>{incidente.fechaCreacion || "—"}</td>
                  <td>{incidente.fechaEliminacion || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={(nueva) => setEstadoPagina({ clave: busqueda.trim().toLowerCase(), pagina: nueva })} />
        </div>
      )}
    </section>
  );
}
