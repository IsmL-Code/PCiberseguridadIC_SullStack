function registrarSolicitud(req, res, next) {
  const inicio = Date.now();
  res.on("finish", () => {
    // eslint-disable-next-line no-console -- Render captures stdout as application logs.
    console.info(JSON.stringify({
      fecha: new Date().toISOString(),
      tipo: "solicitud_http",
      metodo: req.method,
      ruta: req.path,
      estado: res.statusCode,
      duracionMs: Date.now() - inicio
    }));
  });
  next();
}

module.exports = { registrarSolicitud };
