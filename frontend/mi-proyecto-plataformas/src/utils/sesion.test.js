import test from "node:test";
import assert from "node:assert/strict";
import {
  obtenerSesion,
  guardarSesion,
  tieneAccesoARuta,
  destinoSeguro,
  limpiarSesion
} from "./sesion.js";

function crearStorage(datos = {}) {
  const mapa = new Map(Object.entries(datos));
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
    has: (k) => mapa.has(k)
  };
}

const AHORA = 1_800_000_000_000;
const sesionCon = ({ rol = "Administrador", expiraEn = AHORA + 60_000 } = {}, extra = {}) => crearStorage({
  isAuthenticated: "true",
  csrfToken: "csrf",
  sessionExpiresAt: String(expiraEn),
  usuario: JSON.stringify({ nombre: "Ana", rol }),
  ...extra
});

test("sin sesión no está autenticado", () => {
  assert.equal(obtenerSesion(crearStorage(), AHORA).autenticado, false);
});

test("sesión vigente autentica y toma el rol del usuario", () => {
  const sesion = obtenerSesion(sesionCon({ rol: "Analista" }), AHORA);
  assert.equal(sesion.autenticado, true);
  assert.equal(sesion.rol, "analista");
  assert.equal(sesion.csrfToken, "csrf");
});

test("guardarSesion no almacena el token JWT", () => {
  const storage = crearStorage();
  guardarSesion({ usuario: { rol: "Supervisor" }, csrfToken: "abc", expiraEn: AHORA + 1000 }, storage);
  assert.equal(storage.has("authToken"), false);
  assert.equal(obtenerSesion(storage, AHORA).autenticado, true);
});

test("sesión expirada o sin token CSRF invalida la sesión", () => {
  assert.equal(obtenerSesion(sesionCon({ expiraEn: AHORA - 1 }), AHORA).autenticado, false);
  assert.equal(obtenerSesion(sesionCon({}, { csrfToken: "" }), AHORA).autenticado, false);
});

test("rol desconocido o usuario corrupto invalida la sesión", () => {
  assert.equal(obtenerSesion(sesionCon({ rol: "root" }), AHORA).autenticado, false);
  assert.equal(obtenerSesion(sesionCon({}, { usuario: "{no-json" }), AHORA).autenticado, false);
});

test("permisos por ruta según rol", () => {
  assert.equal(tieneAccesoARuta("Administrador", "usuarios"), true);
  assert.equal(tieneAccesoARuta("supervisor", "usuarios"), false);
  assert.equal(tieneAccesoARuta("analista", "usuarios-fuera-servicio"), false);
  for (const rol of ["administrador", "analista", "supervisor"]) {
    assert.equal(tieneAccesoARuta(rol, "incidentes"), true);
  }
  assert.equal(tieneAccesoARuta("administrador", "inexistente"), false);
});

test("destinoSeguro solo acepta rutas internas del panel", () => {
  assert.equal(destinoSeguro("/dashboard/usuarios"), "/dashboard/usuarios");
  assert.equal(destinoSeguro("https://evil.com"), "/dashboard");
  assert.equal(destinoSeguro("//evil.com"), "/dashboard");
  assert.equal(destinoSeguro(undefined), "/dashboard");
});

test("limpiarSesion elimina las claves", () => {
  const storage = sesionCon({ rol: "Analista" });
  limpiarSesion(storage);
  assert.equal(storage.has("csrfToken"), false);
  assert.equal(storage.has("usuario"), false);
});
