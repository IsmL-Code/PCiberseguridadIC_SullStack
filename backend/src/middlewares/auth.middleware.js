const jwt = require("jsonwebtoken");
const prisma = require("../database/prisma");
const { obtenerSecretoJwt } = require("../config/jwt");
const { NOMBRE_COOKIE_SESION, METODOS_SEGUROS, leerCookie } = require("../config/sesion");
const { tokenCsrfValido } = require("./csrf.middleware");
const { tokenRevocado } = require("../utils/tokensRevocados");
const { obtenerEstado, guardarEstado, versionActual } = require("../utils/estadoUsuarioCache");

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

async function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;
  const tokenCabecera = encabezado && encabezado.startsWith("Bearer ")
    ? encabezado.slice(7)
    : null;
  const tokenCookie = tokenCabecera ? null : leerCookie(req, NOMBRE_COOKIE_SESION);
  const token = tokenCabecera || tokenCookie;

  if (!token) {
    return res.status(401).json({ error: "Token de autenticación requerido" });
  }

  try {
    req.usuario = jwt.verify(
      token,
      obtenerSecretoJwt()
    );
  } catch {
    return res.status(401).json({ error: "Token de autenticación inválido" });
  }

  if (tokenRevocado(req.usuario.jti)) {
    return res.status(401).json({ error: "Sesion cerrada" });
  }

  // Las cookies las envía el navegador solas: exigen token CSRF al modificar datos
  if (
    tokenCookie
    && !METODOS_SEGUROS.has(req.method)
    && !tokenCsrfValido(req.usuario.csrf, req.get("x-csrf-token"))
  ) {
    return res.status(403).json({ error: "Token CSRF inválido o ausente" });
  }

  // Un usuario suspendido o eliminado pierde el acceso aunque su JWT siga vigente
  try {
    const usuarioId = Number(req.usuario.sub);
    let status = obtenerEstado(usuarioId);
    if (status === undefined) {
      const versionInicial = versionActual();
      const actual = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { status: true }
      });
      status = actual ? actual.status : null;
      if (status) guardarEstado(usuarioId, status, versionInicial);
    }
    if (status !== "ACTIVE") {
      return res.status(401).json({ error: "Sesión no válida" });
    }
  } catch (error) {
    return next(error);
  }

  next();
}

module.exports = { validarCredenciales, verificarToken };