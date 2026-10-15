// Caché en memoria del estado del usuario para no consultar la base de datos en cada petición.
// El TTL corto limita cuánto tarda en notarse un cambio; el servicio de usuarios la invalida al instante.
// TTL configurable (ms): 0 desactiva la caché. Por defecto 5 s para limitar el desfase entre instancias
const TTL_CONFIGURADO = Number.parseInt(process.env.USER_STATUS_CACHE_TTL_MS, 10);
const TTL_MS = process.env.NODE_ENV === "test"
  ? 0
  : Math.min(60000, Math.max(0, Number.isNaN(TTL_CONFIGURADO) ? 5000 : TTL_CONFIGURADO));
const MAX_ENTRADAS = 5000;
const cache = new Map();
// Se incrementa en cada invalidación para descartar lecturas que empezaron antes del cambio
let version = 0;

function versionActual() {
  return version;
}

function obtenerEstado(id) {
  const entrada = cache.get(id);
  if (!entrada) return undefined;
  if (entrada.expira <= Date.now()) {
    cache.delete(id);
    return undefined;
  }
  return entrada.status;
}

function guardarEstado(id, status, versionInicial) {
  if (TTL_MS <= 0 || versionInicial !== version) return;
  if (cache.size >= MAX_ENTRADAS) cache.delete(cache.keys().next().value);
  cache.set(id, { status, expira: Date.now() + TTL_MS });
}

function invalidarEstado(id) {
  version += 1;
  cache.delete(Number(id));
}

module.exports = { obtenerEstado, guardarEstado, invalidarEstado, versionActual };
