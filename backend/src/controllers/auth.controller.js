const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../database/prisma");
const { obtenerSecretoJwt } = require("../config/jwt");
const {
  NOMBRE_COOKIE_SESION,
  DURACION_SESION_MS,
  opcionesCookieSesion,
  leerCookie
} = require("../config/sesion");
const { revocarToken } = require("../utils/tokensRevocados");

const { registrarAuditoria } = require("../utils/auditoria");

async function iniciarSesion(req, res, next) {
  const { email, password } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      registrarAuditoria("login_fallido", { email, ip: req.ip });
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      registrarAuditoria("login_fallido", { email, ip: req.ip });
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (usuario.status === "SUSPENDED") {
      registrarAuditoria("login_rechazado_suspendido", { usuarioId: usuario.id, ip: req.ip });
      return res.status(403).json({ error: "Su usuario está actualmente suspendido" });
    }

    if (usuario.status !== "ACTIVE") {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const csrfToken = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email, rol: usuario.rol, csrf: csrfToken },
      obtenerSecretoJwt(),
      { expiresIn: DURACION_SESION_MS / 1000, jwtid: crypto.randomUUID() }
    );

    res.cookie(NOMBRE_COOKIE_SESION, token, {
      ...opcionesCookieSesion(),
      maxAge: DURACION_SESION_MS
    });

    registrarAuditoria("login_exitoso", { usuarioId: usuario.id, ip: req.ip });
    res.json({
      csrfToken,
      expiraEn: Date.now() + DURACION_SESION_MS,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        status: usuario.status
      }
    });
  } catch (error) {
    next(error);
  }
}

function cerrarSesion(req, res) {
  const token = leerCookie(req, NOMBRE_COOKIE_SESION);
  if (token) {
    try {
      const { jti, exp } = jwt.verify(token, obtenerSecretoJwt());
      revocarToken(jti, exp);
    } catch {
      // Token ya invalido o expirado: no hay nada que revocar
    }
  }
  res.clearCookie(NOMBRE_COOKIE_SESION, opcionesCookieSesion());
  res.status(204).end();
}

module.exports = { iniciarSesion, cerrarSesion };