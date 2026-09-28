import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ListaIncidentes from "./components/ListaIncidentes";
import Login from "./components/Login"; // Asegúrate de que este archivo exista en src/components/Login.jsx
import {
  obtenerIncidentes,
  obtenerIncidentePorId,
  crearIncidente,
  actualizarIncidente,
  eliminarIncidente
} from "./services/incidentesApi";
import protegerImage from "../img/proteger.png";

// Componente que envuelve tu Dashboard actual
function Dashboard() {
  const [incidentes, setIncidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cargarIncidentes = async () => {
    setError(null);
    try {
      const datos = await obtenerIncidentes();
      setIncidentes(datos);
    } catch (err) {
      setError(err.message);
    }
  };
 
  useEffect(() => {
    let componenteActivo = true;

    obtenerIncidentes()
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

  const guardarIncidente = async (datos, id) => {
    setError(null);
    try {
      if (id) {
        await actualizarIncidente(id, datos);
      } else {
        await crearIncidente(datos);
      }
      await cargarIncidentes();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const borrarIncidente = async (id) => {
    setError(null);
    try {
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
    return estado === 'en curso' || estado === 'en revisión' || estado === 'en revision' || estado === 'en proceso';
  }).length;
  const incidentesResueltos = incidentes.filter((incidente) => {
    const estado = (incidente.estado || '').toLowerCase();
    return estado === 'resuelto' || estado === 'solucionado';
  }).length;

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };
 
  return (
    <div className="app flex min-h-screen w-full flex-col">
      <header className="app-header">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="app-header__brand min-w-0">
            <img className="app-header__icon" src={protegerImage} alt="" aria-hidden="true" />
            <div>
              <h1>PCiberseguridadIC</h1>
              <p>Plataforma centralizada para registro y seguimiento de amenazas</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <span className="text-[13px] font-semibold text-slate-200">Ismael Cepeda</span>
            <button
              onClick={handleLogout}
              className="shrink-0 cursor-pointer rounded-md border-0 bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      <section className="mx-auto w-full max-w-5xl px-3 pt-6 sm:px-5" aria-labelledby="titulo-monitoreo">
        <h2 id="titulo-monitoreo" className="text-2xl font-bold text-slate-100 sm:text-3xl">Panel de monitoreo</h2>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">
          Resumen en tiempo real del estado de los incidentes registrados en la plataforma.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg border border-slate-700 border-t-4 border-t-blue-500 bg-slate-800/80 px-4 py-6 text-center shadow-sm">
            <strong className="block text-4xl font-bold text-slate-100">{incidentes.length}</strong>
            <span className="mt-2 block text-sm text-slate-300">Incidentes totales</span>
          </article>
          <article className="rounded-lg border border-slate-700 border-t-4 border-t-rose-500 bg-slate-800/80 px-4 py-6 text-center shadow-sm">
            <strong className="block text-4xl font-bold text-slate-100">{incidentesCriticos}</strong>
            <span className="mt-2 block text-sm text-slate-300">Severidad crítica</span>
          </article>
          <article className="rounded-lg border border-slate-700 border-t-4 border-t-amber-400 bg-slate-800/80 px-4 py-6 text-center shadow-sm">
            <strong className="block text-4xl font-bold text-slate-100">{incidentesEnProceso}</strong>
            <span className="mt-2 block text-sm text-slate-300">En proceso</span>
          </article>
          <article className="rounded-lg border border-slate-700 border-t-4 border-t-emerald-400 bg-slate-800/80 px-4 py-6 text-center shadow-sm">
            <strong className="block text-4xl font-bold text-slate-100">{incidentesResueltos}</strong>
            <span className="mt-2 block text-sm text-slate-300">Resueltos</span>
          </article>
        </div>
      </section>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl">
          {cargando && <p className="p-5">Cargando incidentes...</p>}
          {error && <p className="error p-5">Error: {error}</p>}
          {!cargando && (
            <ListaIncidentes
              incidentes={incidentes}
              onGuardar={guardarIncidente}
              onEliminar={borrarIncidente}
              onBuscarPorId={buscarIncidentePorId}
            />
          )}
        </div>
      </main>
      <footer className="mt-8 border-t border-slate-700 bg-[#17233f] text-slate-200">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-5 py-8 sm:px-8 md:grid-cols-2 md:gap-12">
          <section>
            <h2 className="mb-4 text-base font-bold text-white">PCiberseguridadIC</h2>
            <p className="text-sm leading-6 text-slate-200">
              Interfaz de referencia — Unidad 2: JavaScript moderno, DOM y MVC.
            </p>
          </section>
          <section>
            <h2 className="mb-4 text-sm font-bold text-white">Contacto del equipo SOC</h2>
            <div className="space-y-3 text-sm text-slate-200">
              <p>soc@PCiberseguridadIC.com</p>
              <p>Línea de emergencia: +593 991 855 531</p>
            </div>
          </section>
        </div>
        <div className="border-t border-slate-700/80 px-5 py-4 text-center text-xs text-slate-300">
          © 2026 PCiberseguridadIC. Unidad 2 — JavaScript moderno, DOM y MVC.
        </div>
      </footer>
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