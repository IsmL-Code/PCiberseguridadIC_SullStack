import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { obtenerSesion, limpiarSesionLocal } from "./utils/sesion";
import { obtenerUsuarioAutenticado } from "./services/authApi";
import IncidentesPage from "./pages/IncidentesPage";
import RegistroUsuarios from "./pages/RegistroUsuarios";
import UsuariosFueraServicio from "./pages/UsuariosFueraServicio";
import IncidentesEliminados from "./pages/IncidentesEliminados";
import AccesoDenegado from "./pages/AccesoDenegado";
import NoEncontrado from "./pages/NoEncontrado";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import { RutaPrivada, RutaPublica, RutaPorRol, FueraDelPanel } from "./components/RutasProtegidas";

// Componente Principal con las Rutas
export default function App() {
  const [sesionVerificada, setSesionVerificada] = useState(false);

  // La sesión local solo sirve para la UI: se valida con el backend antes de pintar el panel
  useEffect(() => {
    let activo = true;
    obtenerUsuarioAutenticado()
      .then(() => {
        if (activo) setSesionVerificada(true);
      })
      .catch(() => {
        limpiarSesionLocal();
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        } else if (activo) {
          setSesionVerificada(true);
        }
      });
    return () => {
      activo = false;
    };
  }, []);

  if (!sesionVerificada) return null;

  return (
    <Router>
      <Routes>
        {/* Ruta por defecto: según la sesión va al panel o al login */}
        <Route
          index
          element={<Navigate to={obtenerSesion().autenticado ? "/dashboard" : "/login"} replace />}
        />

        {/* Ruta pública del Login */}
        <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

        {/* Pantalla independiente, accesible sin el layout del panel */}
        <Route path="/acceso-denegado" element={<AccesoDenegado pantallaCompleta />} />
        <Route path="/no-encontrado" element={<NoEncontrado pantallaCompleta />} />

        {/* Rutas protegidas del panel */}
        <Route
          path="/dashboard"
          element={
            <RutaPrivada>
              <DashboardLayout />
            </RutaPrivada>
          }
        >
          <Route index element={<Navigate to="incidentes" replace />} />
          <Route
            path="incidentes"
            element={<RutaPorRol ruta="incidentes"><IncidentesPage /></RutaPorRol>}
          />
          <Route
            path="usuarios"
            element={<RutaPorRol ruta="usuarios"><RegistroUsuarios /></RutaPorRol>}
          />
          <Route
            path="usuarios-fuera-servicio"
            element={<RutaPorRol ruta="usuarios-fuera-servicio"><UsuariosFueraServicio /></RutaPorRol>}
          />
          <Route
            path="incidentes-eliminados"
            element={<RutaPorRol ruta="incidentes-eliminados"><IncidentesEliminados /></RutaPorRol>}
          />
          <Route path="*" element={<Navigate to="/no-encontrado" replace />} />
        </Route>

        <Route path="*" element={<FueraDelPanel />} />
      </Routes>
    </Router>
  );
}

