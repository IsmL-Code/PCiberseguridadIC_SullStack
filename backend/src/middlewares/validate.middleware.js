function validar(schema) {
 return (req, res, next) => {
 const resultado = schema.safeParse(req.body);
 if (!resultado.success) {
 return res.status(400).json({
 error: "Datos no válidos",
 detalles: resultado.error.issues.map((item) => ({
 campo: item.path.join("."),
 mensaje: item.message
 }))
 });
 }
 
 req.body = resultado.data;
 next();
 };
}

module.exports = { validar };