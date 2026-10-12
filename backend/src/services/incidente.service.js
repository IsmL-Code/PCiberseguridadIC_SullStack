const prisma = require("../database/prisma");

function normalizarRol(rol) {
  return typeof rol === "string" ? rol.trim().toLowerCase() : "";
}

function crear(datos) {
 return prisma.incidente.create({ data: datos });
}

function listar({ usuarioId, rol, estado, prioridad }) {
  const rolNormalizado = normalizarRol(rol);
  const filtro = {
    estado: estado || undefined,
    prioridad: prioridad || undefined,
    deletedAt: null
  };

  if (rolNormalizado === "administrador" || rolNormalizado === "supervisor") {
    return prisma.incidente.findMany({
      where: filtro,
      orderBy: { createdAt: "desc" }
    });
  }

  return prisma.incidente.findMany({
    where: {
      ...filtro,
      usuarioId
    },
    orderBy: { createdAt: "desc" }
  });
}

function buscarPorId(id, usuarioId, rol) {
  const rolNormalizado = normalizarRol(rol);
  const where = rolNormalizado === "administrador" || rolNormalizado === "supervisor"
    ? { id, deletedAt: null }
    : { id, usuarioId, deletedAt: null };

  return prisma.incidente.findFirst({ where });
}

function actualizar(id, usuarioId, datos, rol) {
  const rolNormalizado = normalizarRol(rol);
  const where = rolNormalizado === "administrador" || rolNormalizado === "supervisor"
    ? { id, deletedAt: null }
    : { id, usuarioId, deletedAt: null };

  return prisma.incidente.update({ where, data: datos });
}

// Borrado lógico: conserva el registro y marca la fecha de eliminación
function eliminar(id, usuarioId, rol) {
  const where = normalizarRol(rol) === "administrador"
    ? { id, deletedAt: null }
    : { id, usuarioId, deletedAt: null };

  return prisma.incidente.update({ where, data: { deletedAt: new Date() } });
}

module.exports = { crear, listar, buscarPorId, actualizar, eliminar };
