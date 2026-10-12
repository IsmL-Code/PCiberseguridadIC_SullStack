export const ROLES = Object.freeze({
  ADMINISTRADOR: "administrador",
  ANALISTA: "analista",
  SUPERVISOR: "supervisor"
});

// Roles con acceso a cada sección del panel (misma regla que aplica el backend)
export const ACCESO_RUTAS = Object.freeze({
  incidentes: Object.values(ROLES),
  usuarios: [ROLES.ADMINISTRADOR],
  "usuarios-fuera-servicio": [ROLES.ADMINISTRADOR]
});

const CLAVES_SESION = ["isAuthenticated", "authToken", "usuario"];

export function normalizarRol(rol) {
  return typeof rol === "string" ? rol.trim().toLocaleLowerCase("es") : "";
}

export function decodificarJwt(token) {
  if (typeof token !== "string") return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;

  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const relleno = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(relleno), (c) => c.charCodeAt(0))
    );
    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

export function obtenerExpiracionMs(token) {
  const payload = decodificarJwt(token);
  return typeof payload?.exp === "number" ? payload.exp * 1000 : null;
}

const SESION_INVALIDA = Object.freeze({
  autenticado: false,
  rol: "",
  usuario: null,
  token: null
});

// El rol sale del JWT, no del objeto "usuario" guardado, que el usuario puede editar
export function obtenerSesion(storage = localStorage, ahora = Date.now()) {
  const token = storage.getItem("authToken");
  if (storage.getItem("isAuthenticated") !== "true" || !token) return SESION_INVALIDA;

  const payload = decodificarJwt(token);
  if (!payload) return SESION_INVALIDA;

  const expiracion = obtenerExpiracionMs(token);
  if (expiracion !== null && expiracion <= ahora) return SESION_INVALIDA;

  const rol = normalizarRol(payload.rol);
  if (!Object.values(ROLES).includes(rol)) return SESION_INVALIDA;

  let usuario;
  try {
    usuario = JSON.parse(storage.getItem("usuario") || "null");
  } catch {
    usuario = null;
  }

  return { autenticado: true, rol, usuario, token };
}

export function limpiarSesion(storage = localStorage) {
  CLAVES_SESION.forEach((clave) => storage.removeItem(clave));
}

export function tieneAccesoARuta(rol, ruta) {
  return (ACCESO_RUTAS[ruta] || []).includes(normalizarRol(rol));
}

// Solo se vuelve a rutas internas del panel (evita redirecciones abiertas)
export function destinoSeguro(destino) {
  return typeof destino === "string"
    && /^\/dashboard(\/[A-Za-z0-9\-_/]*)?$/.test(destino)
    ? destino
    : "/dashboard";
}

export function obtenerUsuarioActual() {
  const { usuario, rol } = obtenerSesion();
  return { usuario, rol, esAdministrador: rol === ROLES.ADMINISTRADOR };
}
