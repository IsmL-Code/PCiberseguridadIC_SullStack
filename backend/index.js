const express = require("express");
const cors = require("cors");
 
const app = express();
 
app.use(cors());
app.use(express.json());
 

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next(); 
});
 
app.use("/incidentes", require("./routers/incidentes.routes"));

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "El cuerpo de la solicitud no contiene un JSON válido" });
  }

  res.status(err.status || 500).json({
    error: err.status && err.status < 500 ? err.message : "Error interno del servidor"
  });
});
 
app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});