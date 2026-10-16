const prisma = require("../database/prisma");
const bcrypt = require("bcryptjs");
const { invalidarEstado } = require("../utils/estadoUsuarioCache");
const { paginarConTotal } = require("../utils/paginacion");


const COSTO_BCRYPT = Math.min(14, Math.max(10, parseInt(process.env.BCRYPT_COST, 10) || 12));

const camposPublicos = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  rol: true,
  status: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true
};

async function prepararDatos(datos, incluirPassword = true) {
  const datosPreparados = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    rol: datos.rol,
    status: datos.status
  };

  if (datos.status !== undefined) {
    datosPreparados.deletedAt = datos.status === "DELETED" ? new Date() : null;
  }

  if (incluirPassword || datos.password) {
    datosPreparados.password = await bcrypt.hash(datos.password, COSTO_BCRYPT);
  }

  return datosPreparados;
}

async function listar(paginacion) {
  const consulta = { select: camposPublicos, orderBy: { createdAt: "desc" } };
  if (!paginacion) {
    return prisma.usuario.findMany(consulta);
  }
  return paginarConTotal(prisma.usuario, consulta, paginacion);
}

function buscarPorId(id) {
  return prisma.usuario.findUnique({ where: { id }, select: camposPublicos });
}

async function crear(datos) {
  return prisma.usuario.create({
    data: await prepararDatos(datos),
    select: camposPublicos
  });
}

async function actualizar(id, datos) {
  const usuario = await prisma.usuario.update({
    where: { id },
    data: await prepararDatos(datos, false),
    select: camposPublicos
  });
  invalidarEstado(id);
  return usuario;
}

function eliminar(id) {
  return actualizarEstado(id, "DELETED");
}

async function actualizarEstado(id, status) {
  const usuario = await prisma.usuario.update({
    where: { id },
    data: {
      status,
      deletedAt: status === "DELETED" ? new Date() : null
    },
    select: camposPublicos
  });
  invalidarEstado(id);
  return usuario;
}

module.exports = { listar, buscarPorId, crear, actualizar, actualizarEstado, eliminar };