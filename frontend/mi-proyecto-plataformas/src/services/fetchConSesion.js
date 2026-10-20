import { limpiarSesionLocal, redirigirALogin } from "../utils/sesion";

export async function fetchConSesion(url, opciones) {
  const respuesta = await fetch(url, { ...opciones, credentials: "include" });

  if (respuesta.status === 401) {
    limpiarSesionLocal();
    window.dispatchEvent(new Event("auth:session-expired"));
    redirigirALogin();
  }

  return respuesta;
}
