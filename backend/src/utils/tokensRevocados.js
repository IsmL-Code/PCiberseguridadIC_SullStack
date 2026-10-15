// Lista en memoria de tokens revocados (un solo proceso); se purga al expirar cada token
const revocados = new Map();
const INTERVALO_PURGA_MS = 60 * 1000;

function purgarExpirados() {
  const ahora = Date.now();
  for (const [id, exp] of revocados) {
    if (exp <= ahora) revocados.delete(id);
  }
}

// La purga corre periódicamente en lugar de recorrer el mapa en cada revocación
setInterval(purgarExpirados, INTERVALO_PURGA_MS).unref();

function revocarToken(jti, expSegundos) {
  if (!jti) return;
  revocados.set(jti, expSegundos * 1000);
}

function tokenRevocado(jti) {
  return Boolean(jti) && revocados.has(jti);
}

module.exports = { revocarToken, tokenRevocado };
