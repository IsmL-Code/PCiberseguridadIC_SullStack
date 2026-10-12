import { Navigate, useLocation } from "react-router-dom";
import { obtenerSesion, tieneAccesoARuta } from "../utils/sesion";
import { useSesionActiva } from "../hooks/useSesionActiva";

// Protege las rutas privadas y recuerda a dónde quería ir el usuario
export function RutaPrivada({ children }) {
  const sesion = useSesionActiva();
  const location = useLocation();

  return sesion.autenticado
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

// El login no tiene sentido con una sesión activa
export function RutaPublica({ children }) {
  return obtenerSesion().autenticado ? <Navigate to="/dashboard" replace /> : children;
}

// Guarda por rol: muestra "Acceso Denegado" si el rol no tiene acceso a la sección
export function RutaPorRol({ ruta, children }) {
  return tieneAccesoARuta(obtenerSesion().rol, ruta) ? children : <Navigate to="/acceso-denegado" replace />;
}

// Rutas fuera del panel: autenticado ve el 404, si no va al login
export function FueraDelPanel() {
  return obtenerSesion().autenticado
    ? <Navigate to="/no-encontrado" replace />
    : <Navigate to="/login" replace />;
}

