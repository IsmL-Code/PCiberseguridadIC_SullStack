const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const camposPublicos = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  rol: true,
  createdAt: true,
  updatedAt: true
};

async function prepararDatos(datos) {
  return {
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    password: await bcrypt.hash(datos.password, 12),
    rol: datos.rol
  };
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
    data: await prepararDatos(datos),
    select: camposPublicos
  });
}

function eliminar(id) {
  return prisma.usuario.delete({ where: { id } });
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };