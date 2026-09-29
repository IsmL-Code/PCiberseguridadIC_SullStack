const prisma = require("../config/prisma");
function crear(datos) {
 return prisma.incidente.create({ data: datos });
}
function listar({ estado, prioridad }) {
 return prisma.incidente.findMany({
 where: {
 // undefined hace que Prisma ignore el filtro.
 estado: estado || undefined,
 prioridad: prioridad || undefined
 },
 orderBy: { createdAt: "desc" }
 });
}
function buscarPorId(id) {
 return prisma.incidente.findUnique({ where: { id } });
}
function actualizar(id, datos) {
 return prisma.incidente.update({ where: { id }, data: datos });
}
function eliminar(id) {
 return prisma.incidente.delete({ where: { id } });
}
module.exports = { crear, listar, buscarPorId, actualizar, eliminar };
