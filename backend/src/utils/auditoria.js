// Registro de auditoría en JSON por línea; nunca incluye contraseñas ni tokens.
function registrarAuditoria(evento, datos = {}) {
  if (process.env.NODE_ENV === "test") return;
  console.info(JSON.stringify({ fecha: new Date().toISOString(), evento, ...datos }));
}

module.exports = { registrarAuditoria };
