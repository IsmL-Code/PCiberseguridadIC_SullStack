const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rutas = require("./routes/incidente.routes");
const rutasUsuarios = require("./routes/usuario.routes");
const rutasAuth = require("./routes/auth.routes");
const { noEncontrado, manejarError } = require("./middlewares/error.middleware");
const { verificarOrigen } = require("./middlewares/csrf.middleware");
const { limitarPeticiones } = require("./middlewares/limitarPeticiones.middleware");

const app = express();
// Detrás de un proxy (Render, Railway, etc.) permite que los límites usen la IP real del cliente
if (process.env.TRUST_PROXY) {
  const proxies = Number(process.env.TRUST_PROXY);
  app.set("trust proxy", Number.isNaN(proxies) ? process.env.TRUST_PROXY : proxies);
}
app.use(helmet());
const origenFrontend = process.env.FRONTEND_URL
  ? new URL(process.env.FRONTEND_URL).origin
  : null;
const origenPermitido = process.env.NODE_ENV === "production"
  ? [origenFrontend].filter(Boolean)
  : ["http://localhost:5173", "http://127.0.0.1:5173", origenFrontend].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, !origin || origenPermitido.includes(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
  })
);

app.use(verificarOrigen(origenPermitido));
app.use(express.json({ limit: "10kb" }));
app.use("/api", limitarPeticiones);
app.use("/api/incidentes", rutas);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api/auth", rutasAuth);
app.use(noEncontrado);
app.use(manejarError);
module.exports = app;