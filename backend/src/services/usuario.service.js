const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

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
    datosPreparados.password = await bcrypt.hash(datos.password, 12);
  }

  return datosPreparados;
}

function listar() {
  return prisma.usuario.findMany({
    select: camposPublicos,
    orderBy: { createdAt: "desc" }
  });
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
  return prisma.usuario.update({
    where: { id },
    data: await prepararDatos(datos, false),
    select: camposPublicos
  });
}

function eliminar(id) {
  return actualizarEstado(id, "DELETED");
}

function actualizarEstado(id, status) {
  return prisma.usuario.update({
    where: { id },
    data: {
      status,
      deletedAt: status === "DELETED" ? new Date() : null
    },
    select: camposPublicos
  });
}

module.exports = { listar, buscarPorId, crear, actualizar, actualizarEstado, eliminar };