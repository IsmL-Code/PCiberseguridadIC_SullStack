const prisma = require("../config/prisma");
function crear(datos) {
 return prisma.incidente.create({ data: datos });
}
function listar({ usuarioId, estado, prioridad }) {
 return prisma.incidente.findMany({
 where: {
	usuarioId,
 estado: estado || undefined,
 prioridad: prioridad || undefined
 },
 orderBy: { createdAt: "desc" }
 });
}
function buscarPorId(id, usuarioId) {
 return prisma.incidente.findFirst({ where: { id, usuarioId } });
}
function actualizar(id, usuarioId, datos) {
 return prisma.incidente.update({ where: { id, usuarioId }, data: datos });
}
function eliminar(id, usuarioId) {
 return prisma.incidente.delete({ where: { id, usuarioId } });
}
module.exports = { crear, listar, buscarPorId, actualizar, eliminar };
