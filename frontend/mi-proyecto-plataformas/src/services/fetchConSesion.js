export async function fetchConSesion(url, opciones) {
  const respuesta = await fetch(url, { ...opciones, credentials: "include" });

  if (respuesta.status === 401 && localStorage.getItem("isAuthenticated") === "true") {
    window.dispatchEvent(new Event("auth:session-expired"));
  }

  return respuesta;
}
