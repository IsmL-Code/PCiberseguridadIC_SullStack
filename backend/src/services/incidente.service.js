const prisma = require("../database/prisma");
const { paginarConTotal } = require("../utils/paginacion");

function normalizarRol(rol) {
  return typeof rol === "string" ? rol.trim().toLowerCase() : "";
}

function crear(datos) {
 return prisma.incidente.create({ data: datos });
}

async function consultarPagina(consulta, paginacion) {
  if (!paginacion) return prisma.incidente.findMany(consulta);
  return paginarConTotal(prisma.incidente, consulta, paginacion);
}

function listar({ usuarioId, rol, estado, prioridad }, paginacion) {
  const rolNormalizado = normalizarRol(rol);
  const filtro = {
    estado: estado || undefined,
    prioridad: prioridad || undefined,
    deletedAt: null
  };
  const veTodos = rolNormalizado === "administrador" || rolNormalizado === "supervisor";

  return consultarPagina({
    where: veTodos ? filtro : { ...filtro, usuarioId },
    orderBy: { createdAt: "desc" }
  }, paginacion);
}

function listarEliminados(paginacion) {
  return consultarPagina({
    where: { deletedAt: { not: null } },
    include: { usuario: { select: { nombre: true, apellido: true } } },
    orderBy: { deletedAt: "desc" }
  }, paginacion);
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

module.exports = { crear, listar, listarEliminados, buscarPorId, actualizar, eliminar };
