const rateLimit = require("express-rate-limit");

const MAXIMO_INTENTOS = Number(process.env.LOGIN_MAX_INTENTOS) || 4;
const VENTANA_MS = (Number(process.env.LOGIN_VENTANA_MIN) || 1) * 60 * 1000;

// Solo cuentan los intentos fallidos: un login correcto no consume cupo.
const limitarLogin = rateLimit({
  windowMs: VENTANA_MS,
  limit: MAXIMO_INTENTOS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.",
  },
});

module.exports = { limitarLogin };
