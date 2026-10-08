const prisma = require("../config/prisma");

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
    prioridad: prioridad || undefined
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
    ? { id }
    : { id, usuarioId };

  return prisma.incidente.findFirst({ where });
}

function actualizar(id, usuarioId, datos, rol) {
  const rolNormalizado = normalizarRol(rol);
  const where = rolNormalizado === "administrador" || rolNormalizado === "supervisor"
    ? { id }
    : { id, usuarioId };

  return prisma.incidente.update({ where, data: datos });
}

function eliminar(id, usuarioId, rol) {
  if (normalizarRol(rol) === "administrador") {
    return prisma.incidente.delete({ where: { id } });
  }

  return prisma.incidente.delete({ where: { id, usuarioId } });
}

module.exports = { crear, listar, buscarPorId, actualizar, eliminar };
