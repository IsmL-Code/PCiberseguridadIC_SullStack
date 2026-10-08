const express = require("express");
const cors = require("cors");
const rutas = require("./routes/incidente.routes");
const rutasUsuarios = require("./routes/usuario.routes");
const rutasAuth = require("./routes/auth.routes");
const { noEncontrado, manejarError } = require("./middlewares/error.middleware");

const app = express();
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
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/api/incidentes", rutas);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api/auth", rutasAuth);
app.use(noEncontrado);
app.use(manejarError);
module.exports = app;