const jwt = require("jsonwebtoken");

function validarCredenciales(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "El cuerpo de la solicitud debe ser un objeto JSON"
    });
  }

  const { email, password } = req.body;
  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ error: "email y password son obligatorios" });
  }

  req.body = { email: email.trim().toLowerCase(), password };
  next();
}

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;
  const token = encabezado && encabezado.startsWith("Bearer ")
    ? encabezado.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Token de autenticación requerido" });
  }

  try {
    req.usuario = jwt.verify(
      token,
      process.env.JWT_SECRET || "clave-desarrollo-cambiar-en-produccion"
    );
    next();
  } catch {
    return res.status(401).json({ error: "Token de autenticación inválido" });
  }
}

module.exports = { validarCredenciales, verificarToken };