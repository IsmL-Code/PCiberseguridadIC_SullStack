const crypto = require("node:crypto");
const { METODOS_SEGUROS } = require("../config/sesion");

// Rechaza solicitudes que modifican datos desde un origen de navegador no permitido
function verificarOrigen(origenesPermitidos) {
  return (req, res, next) => {
    const origen = req.headers.origin;
    if (!METODOS_SEGUROS.has(req.method) && origen && !origenesPermitidos.includes(origen)) {
      return res.status(403).json({ error: "Origen no permitido" });
    }
    next();
  };
}

function tokenCsrfValido(esperado, recibido) {
  if (typeof esperado !== "string" || typeof recibido !== "string") {
    return false;
  }
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { verificarOrigen, tokenCsrfValido };
