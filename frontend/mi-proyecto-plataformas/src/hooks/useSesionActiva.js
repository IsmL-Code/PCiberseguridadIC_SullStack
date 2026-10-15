import { useState, useEffect } from "react";
import { obtenerSesion, limpiarSesion } from "../utils/sesion";

// Mantiene la sesión sincronizada: expiración de la sesión, otras pestañas y 401 del backend
export function useSesionActiva() {
  const [sesion, setSesion] = useState(() => obtenerSesion());

  useEffect(() => {
    const actualizar = () => {
      const actual = obtenerSesion();
      if (!actual.autenticado) limpiarSesion();
      setSesion(actual);
    };

    const temporizador = sesion.expiraEn
      ? setTimeout(actualizar, Math.min(Math.max(sesion.expiraEn - Date.now(), 0), 2 ** 31 - 1))
      : null;

    window.addEventListener("auth:session-expired", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      if (temporizador) clearTimeout(temporizador);
      window.removeEventListener("auth:session-expired", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, [sesion.expiraEn]);

  return sesion;
}

