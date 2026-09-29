function noEncontrado(req, res) {
 res.status(404).json({ error: "Ruta no encontrada" });
}

function manejarError(error, req, res, next) {
 console.error(error);

 if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
  return res.status(400).json({ error: "El cuerpo JSON no es válido" });
 }

 if (error.code === "P2002") {
  return res.status(409).json({ error: "Ya existe un registro con esos datos" });
 }

 if (error.code === "P2003") {
  return res.status(400).json({ error: "La referencia relacionada no es válida" });
 }

 if (error.code === "P2025") {
  return res.status(404).json({ error: "Registro no encontrado" });
 }

 if (error.name === "PrismaClientValidationError") {
  return res.status(400).json({ error: "Los datos enviados no son válidos" });
 }

 if (error.name === "PrismaClientInitializationError") {
  return res.status(503).json({ error: "La base de datos no está disponible" });
 }

 res.status(500).json({ error: "No fue posible completar la operación" });
}
module.exports = { noEncontrado, manejarError };