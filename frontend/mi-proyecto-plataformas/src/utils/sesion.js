export const ROLES = Object.freeze({
  ADMINISTRADOR: "administrador",
  ANALISTA: "analista",
  SUPERVISOR: "supervisor"
});

// Roles con acceso a cada sección del panel (misma regla que aplica el backend)
export const ACCESO_RUTAS = Object.freeze({
  incidentes: Object.values(ROLES),
  usuarios: [ROLES.ADMINISTRADOR],
  "usuarios-fuera-servicio": [ROLES.ADMINISTRADOR],
  "incidentes-eliminados": [ROLES.ADMINISTRADOR]
});

const CLAVES_SESION = ["isAuthenticated", "usuario", "csrfToken", "sessionExpiresAt", "authToken"];

export function normalizarRol(rol) {
  return typeof rol === "string" ? rol.trim().toLocaleLowerCase("es") : "";
}

const SESION_INVALIDA = Object.freeze({
  autenticado: false,
  rol: "",
  usuario: null,
  csrfToken: null,
  expiraEn: null
});

// El token JWT va en una cookie HttpOnly que el JavaScript no puede leer. El rol guardado
// solo decide qué se muestra en la interfaz: el backend valida siempre los permisos reales.
export function obtenerSesion(storage = localStorage, ahora = Date.now()) {
  const csrfToken = storage.getItem("csrfToken");
  if (storage.getItem("isAuthenticated") !== "true" || !csrfToken) return SESION_INVALIDA;

  const expiraEn = Number(storage.getItem("sessionExpiresAt"));
  if (!Number.isFinite(expiraEn) || expiraEn <= ahora) return SESION_INVALIDA;

  let usuario;
  try {
    usuario = JSON.parse(storage.getItem("usuario") || "null");
  } catch {
    usuario = null;
  }

  const rol = normalizarRol(usuario?.rol);
  if (!Object.values(ROLES).includes(rol)) return SESION_INVALIDA;

  return { autenticado: true, rol, usuario, csrfToken, expiraEn };
}

export function guardarSesion({ usuario, csrfToken, expiraEn }, storage = localStorage) {
  storage.setItem("isAuthenticated", "true");
  storage.setItem("usuario", JSON.stringify(usuario));
  storage.setItem("csrfToken", csrfToken);
  storage.setItem("sessionExpiresAt", String(expiraEn));
}

export function limpiarSesionLocal(storage = localStorage) {
  ["isAuthenticated", "usuario", "csrfToken", "sessionExpiresAt"].forEach((clave) => storage.removeItem(clave));
}

export function limpiarSesion(storage = localStorage) {
  CLAVES_SESION.forEach((clave) => storage.removeItem(clave));
}

export function redirigirALogin() {
  if (window.location.pathname !== "/login") window.location.replace("/login");
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
