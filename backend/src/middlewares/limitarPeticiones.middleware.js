const rateLimit = require("express-rate-limit");

const limitarPeticiones = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_MAX_PETICIONES) || 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
});

module.exports = { limitarPeticiones };
