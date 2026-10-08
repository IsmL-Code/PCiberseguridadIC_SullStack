const crypto = require("node:crypto");

function obtenerSecretoJwt() {
  const secretoConfigurado = process.env.JWT_SECRET;
  if (secretoConfigurado) {
    if (secretoConfigurado.length < 32) {
      throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
    }
    return secretoConfigurado;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET es obligatorio en producción");
  }

  const secretoTemporal = crypto.randomBytes(32).toString("hex");
  process.env.JWT_SECRET = secretoTemporal;
  console.warn("JWT_SECRET no está configurado: se generó una clave temporal solo para este proceso.");
  return secretoTemporal;
}

module.exports = { obtenerSecretoJwt };
