import { useState, useEffect } from "react";
import ListaIncidentes from "./ListaIncidentes";
import DashboardIcon from "../components/DashboardIcon";
import { obtenerUsuarioActual } from "../utils/sesion";
import {
  obtenerIncidentes,
  crearIncidente,
  actualizarIncidente,
  eliminarIncidente
} from "../services/incidentesApi";

// Página de incidentes (ruta /dashboard/incidentes)
export default function IncidentesPage() {
  const [incidentes, setIncidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [filtros, setFiltros] = useState({ estado: '', prioridad: '' });
  const { rol: rolUsuario, esAdministrador } = obtenerUsuarioActual();
  const puedeCrearIncidentes = esAdministrador || rolUsuario === "analista";
  const puedeActualizarIncidentes = esAdministrador || rolUsuario === "supervisor";
  const puedeEliminarIncidentes = esAdministrador;

  const cargarIncidentes = async (filtrosActuales = filtros) => {
    setError(null);
    try {
      const datos = await obtenerIncidentes(filtrosActuales);
      setIncidentes(datos);
    } catch (err) {
      setError(err.message);
    }
  };
 
  useEffect(() => {
    let componenteActivo = true;

    obtenerIncidentes(filtros)
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
  }, [filtros]);

  const guardarIncidente = async (datos, id) => {
    setError(null);
    setMensajeExito('');
    try {
      if ((id && !puedeActualizarIncidentes) || (!id && !puedeCrearIncidentes)) {
        throw new Error("No tienes permisos para realizar esta acción.");
      }

      if (id) {
        await actualizarIncidente(id, datos);
        setMensajeExito('Incidente modificado satisfactoriamente.');
      } else {
        await crearIncidente(datos);
        setMensajeExito('Incidente guardado satisfactoriamente.');
      }
      await cargarIncidentes(filtros);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const borrarIncidente = async (id) => {
    setError(null);
    setMensajeExito('');
    try {
      if (!puedeEliminarIncidentes) {
        throw new Error("No tienes permisos para eliminar incidentes.");
      }

      await eliminarIncidente(id);
      setIncidentes((actuales) => actuales.filter((incidente) => incidente.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const incidentesCriticos = incidentes.filter((incidente) => {
    const prioridad = (incidente.prioridad || '').toLowerCase();
    return prioridad === 'crítica' || prioridad === 'critica';
  }).length;
  const incidentesEnProceso = incidentes.filter((incidente) => {
    const estado = (incidente.estado || '').toLowerCase();
    return estado === 'en_proceso' || estado === 'en curso' || estado === 'en revisión' || estado === 'en revision' || estado === 'en proceso';
  }).length;
  const incidentesResueltos = incidentes.filter((incidente) => {
    const estado = (incidente.estado || '').toLowerCase();
    return estado === 'cerrado' || estado === 'resuelto' || estado === 'solucionado';
  }).length;

  return (
    <>
      <section aria-labelledby="titulo-monitoreo">
        <div className="dashboard-title">
          <DashboardIcon name="monitor" />
          <div>
            <h1 id="titulo-monitoreo">Panel de monitoreo</h1>
            <p>Resumen en tiempo real del estado de los incidentes registrados en la plataforma.</p>
          </div>
        </div>
        <div className="dashboard-stats">
          <article className="dashboard-stat dashboard-stat--blue">
            <span className="dashboard-stat__icon"><DashboardIcon name="people" /></span>
            <div><strong>{incidentes.length}</strong><span>Incidentes totales</span></div>
          </article>
          <article className="dashboard-stat dashboard-stat--purple">
            <span className="dashboard-stat__icon"><DashboardIcon name="shield" /></span>
            <div><strong>{incidentesCriticos}</strong><span>Severidad crítica</span></div>
          </article>
          <article className="dashboard-stat dashboard-stat--amber">
            <span className="dashboard-stat__icon"><DashboardIcon name="settings" /></span>
            <div><strong>{incidentesEnProceso}</strong><span>En proceso</span></div>
          </article>
          <article className="dashboard-stat dashboard-stat--green">
            <span className="dashboard-stat__icon"><DashboardIcon name="file" /></span>
            <div><strong>{incidentesResueltos}</strong><span>Resultados</span></div>
          </article>
        </div>
      </section>

      {cargando && <p className="dashboard-message">Cargando incidentes...</p>}
      {error && <p className="dashboard-message dashboard-message--error" role="alert">Error: {error}</p>}
      {mensajeExito && <p className="dashboard-message dashboard-message--success" role="status">{mensajeExito}</p>}
      {!cargando && (
        <section id="incidentes" className="dashboard-records" aria-label="Registro de incidentes">
          <div className="dashboard-records__heading">
            <div>
              <h2>Registro de incidentes</h2>
              <p>Consulta, filtra y administra los incidentes reportados.</p>
            </div>
          </div>
          <ListaIncidentes
            incidentes={incidentes}
            onGuardar={guardarIncidente}
            onEliminar={borrarIncidente}
            filtros={filtros}
            onFiltrosChange={setFiltros}
            puedeCrear={puedeCrearIncidentes}
            puedeActualizar={puedeActualizarIncidentes}
            puedeEliminar={puedeEliminarIncidentes}
          />
        </section>
      )}
    </>
  );
}

