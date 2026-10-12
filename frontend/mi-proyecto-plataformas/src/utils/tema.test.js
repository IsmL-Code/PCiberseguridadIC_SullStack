import test from "node:test";
import assert from "node:assert/strict";
import {
  CLAVE_TEMA,
  aplicarTema,
  guardarTema,
  normalizarTema,
  obtenerTemaGuardado
} from "./tema.js";

function crearStorage(datos = {}) {
  const mapa = new Map(Object.entries(datos));
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v))
  };
}

test("el tema predeterminado es claro", () => {
  assert.equal(obtenerTemaGuardado(crearStorage()), "light");
});

test("recuerda el tema oscuro guardado", () => {
  const storage = crearStorage();
  guardarTema("dark", storage);
  assert.equal(storage.getItem(CLAVE_TEMA), "dark");
  assert.equal(obtenerTemaGuardado(storage), "dark");
});

test("ignora valores inválidos", () => {
  assert.equal(normalizarTema("azul"), "light");
  assert.equal(obtenerTemaGuardado(crearStorage({ tema: "<script>" })), "light");
});

test("aplica el tema como atributo data-theme", () => {
  const atributos = {};
  aplicarTema("dark", { setAttribute: (k, v) => { atributos[k] = v; } });
  assert.equal(atributos["data-theme"], "dark");
});
