import test from "node:test";
import { Buffer } from "node:buffer";
import assert from "node:assert/strict";
import {
  obtenerSesion,
  tieneAccesoARuta,
  destinoSeguro,
  limpiarSesion
} from "./sesion.js";

const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const crearToken = (payload) => `${base64url({ alg: "HS256" })}.${base64url(payload)}.firma`;

function crearStorage(datos = {}) {
  const mapa = new Map(Object.entries(datos));
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    removeItem: (k) => mapa.delete(k),
    has: (k) => mapa.has(k)
  };
}

const AHORA = 1_800_000_000_000;
const sesionCon = (payload, extra = {}) => crearStorage({
  isAuthenticated: "true",
  authToken: crearToken(payload),
  usuario: JSON.stringify({ nombre: "Ana", rol: "Administrador" }),
  ...extra
});

test("sin sesión no está autenticado", () => {
  assert.equal(obtenerSesion(crearStorage(), AHORA).autenticado, false);
});

test("token válido autentica y toma el rol del token", () => {
  const sesion = obtenerSesion(sesionCon({ rol: "Analista", exp: AHORA / 1000 + 60 }), AHORA);
  assert.equal(sesion.autenticado, true);
  assert.equal(sesion.rol, "analista");
});

test("el rol manipulado en localStorage no otorga privilegios", () => {
  const sesion = obtenerSesion(sesionCon({ rol: "Analista" }), AHORA);
  assert.equal(sesion.usuario.rol, "Administrador");
  assert.equal(tieneAccesoARuta(sesion.rol, "usuarios"), false);
});

test("token expirado invalida la sesión", () => {
  assert.equal(obtenerSesion(sesionCon({ rol: "Administrador", exp: AHORA / 1000 - 1 }), AHORA).autenticado, false);
});

test("token malformado o rol desconocido invalida la sesión", () => {
  assert.equal(obtenerSesion(crearStorage({ isAuthenticated: "true", authToken: "abc" }), AHORA).autenticado, false);
  assert.equal(obtenerSesion(sesionCon({ rol: "root" }), AHORA).autenticado, false);
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
  assert.equal(storage.has("authToken"), false);
  assert.equal(storage.has("usuario"), false);
});
