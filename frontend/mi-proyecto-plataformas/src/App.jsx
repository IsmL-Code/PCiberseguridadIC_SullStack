import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ListaIncidentes from "./components/ListaIncidentes";
import RegistroUsuarios from "./components/RegistroUsuarios";
import UsuariosFueraServicio from "./components/UsuariosFueraServicio";
import Login from "./components/Login"; // Asegúrate de que este archivo exista en src/components/Login.jsx
import {
  obtenerIncidentes,
  obtenerIncidentePorId,
  crearIncidente,
  actualizarIncidente,
  eliminarIncidente
} from "./services/incidentesApi";
import protegerImage from "../img/proteger.png";

const iconPaths = {
  home: "M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5z M9 21v-6h6v6",
  user: "M20 21a8 8 0 0 0-16 0 M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  pin: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  mail: "M3 5h18v14H3z M3 6l9 7 9-7",
  monitor: "M3 4h18v13H3z M8 21h8 M12 17v4",
  people: "M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  shield: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z M9 12l2 2 4-4",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.09-.02a1.7 1.7 0 0 0-1.7.5l-.06.06h-3.4l-.04-.08a1.7 1.7 0 0 0-1.35-1.02l-.09-.01-1.7-2.94.06-.06A1.7 1.7 0 0 0 10 14.4v-.08l-1.7-2.94.04-.08a1.7 1.7 0 0 0 0-1.6l-.04-.08L10 6.68l.09.01a1.7 1.7 0 0 0 1.35-1.02l.04-.08h3.4l.06.06a1.7 1.7 0 0 0 1.7.5l.09-.02 1.7 2.94-.06.06a1.7 1.7 0 0 0-.34 1.88v.08l.34.92Z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8",
  logout: "M10 17l5-5-5-5 M15 12H3 M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6",
};

function DashboardIcon({ name, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

// Componente que envuelve tu Dashboard actual
function Dashboard() {
  const [incidentes, setIncidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [filtros, setFiltros] = useState({ estado: '', prioridad: '' });
  const [vistaActual, setVistaActual] = useState("incidentes");
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const rolUsuario = usuario?.rol?.trim().toLocaleLowerCase("es") || "";
  const esAdministrador = rolUsuario === "administrador";
  const puedeCrearIncidentes = esAdministrador || rolUsuario === "analista";
  const puedeActualizarIncidentes = esAdministrador || rolUsuario === "supervisor";
  const puedeEliminarIncidentes = esAdministrador;
  const nombreUsuario = usuario
    ? `${usuario.nombre} ${usuario.apellido}`.trim()
    : "Usuario";
  const scrollAIncidentes = () => {
    setVistaActual("incidentes");
    setMenuMovilAbierto(false);
  };

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

  const buscarIncidentePorId = (id) => obtenerIncidentePorId(id);

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

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    navigate("/login");
  };
 
  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <button
          type="button"
          className="dashboard-menu-toggle"
          aria-label={menuMovilAbierto ? "Cerrar menú principal" : "Abrir menú principal"}
          aria-expanded={menuMovilAbierto}
          aria-controls="dashboard-navigation"
          onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuMovilAbierto ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <a className="dashboard-brand" href="/dashboard" aria-label="PCiberseguridadIC, panel principal">
          <img className="app-header__icon" src={protegerImage} alt="" aria-hidden="true" />
          <span>
            <strong>PCiberseguridadIC</strong>
            <small>Plataforma centralizada para registro y seguimiento de amenazas</small>
          </span>
        </a>
        <div className="dashboard-user">
          <span className="dashboard-avatar" aria-hidden="true">
            <DashboardIcon name="user" />
          </span>
          <span className="dashboard-user__name">{nombreUsuario}</span>
          <button type="button" onClick={handleLogout} className="dashboard-logout">
            <DashboardIcon name="logout" />
            Salir
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div>
            <p className="dashboard-sidebar__heading">Menú principal</p>
            <nav id="dashboard-navigation" aria-label="Menú principal" className={`dashboard-nav${menuMovilAbierto ? " is-open" : ""}`}>
              <button
                type="button"
                className={`dashboard-nav__item${vistaActual === "incidentes" ? " is-active" : ""}`}
                onClick={scrollAIncidentes}
                aria-current={vistaActual === "incidentes" ? "page" : undefined}
              >
                <DashboardIcon name="home" />
                <span>Registrar incidentes</span>
              </button>
              {esAdministrador && (
                <>
                  <button
                    type="button"
                    className={`dashboard-nav__item${vistaActual === "usuarios" ? " is-active" : ""}`}
                    onClick={() => {
                      setVistaActual("usuarios");
                      setMenuMovilAbierto(false);
                    }}
                    aria-current={vistaActual === "usuarios" ? "page" : undefined}
                  >
                    <DashboardIcon name="user" />
                    <span>Registrar nuevo usuario</span>
                  </button>
                  <button
                    type="button"
                    className={`dashboard-nav__item${vistaActual === "usuarios-fuera-servicio" ? " is-active" : ""}`}
                    onClick={() => {
                      setVistaActual("usuarios-fuera-servicio");
                      setMenuMovilAbierto(false);
                    }}
                    aria-current={vistaActual === "usuarios-fuera-servicio" ? "page" : undefined}
                  >
                    <DashboardIcon name="pin" />
                    <span>Usuarios fuera de servicio</span>
                  </button>
                  <button type="button" className="dashboard-nav__item" disabled title="Esta opción aún no está disponible">
                    <DashboardIcon name="mail" />
                    <span>Buzón de comunicación</span>
                    <small>Próximamente</small>
                  </button>
                </>
              )}
            </nav>
          </div>
          <div className="dashboard-sidebar__footer">

          </div>
        </aside>

        <main className="dashboard-content">
          {vistaActual === "usuarios" ? (
            <RegistroUsuarios />
          ) : vistaActual === "usuarios-fuera-servicio" ? (
            <UsuariosFueraServicio />
          ) : (
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
                    onBuscarPorId={buscarIncidentePorId}
                    filtros={filtros}
                    onFiltrosChange={setFiltros}
                    puedeCrear={puedeCrearIncidentes}
                    puedeActualizar={puedeActualizarIncidentes}
                    puedeEliminar={puedeEliminarIncidentes}
                  />
                </section>
              )}
            </>
          )}
          <footer className="dashboard-footer">
            <span>© 2026 PCiberseguridadIC · Ismael Condo</span>
            <span>Equipo SOC: soc@PCiberseguridadIC.com</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Componente de protección de ruta privada
function RutaPrivada({ children }) {
  const estaAutenticado = localStorage.getItem("isAuthenticated") === "true";
  return estaAutenticado ? children : <Navigate to="/login" />;
}

// Componente Principal con las Rutas
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública del Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida que carga tu panel de incidentes */}
        <Route
          path="/dashboard"
          element={
            <RutaPrivada>
              <Dashboard />
            </RutaPrivada>
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}