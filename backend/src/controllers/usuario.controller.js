const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

function obtenerIdValido(id) {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

async function datosUsuario(body) {
  const { nombre, apellido, email, password, rol } = body;
  return {
    nombre,
    apellido,
    email,
    password: await bcrypt.hash(password, 12),
    rol
  };
}

async function listar(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "El cuerpo de la solicitud debe ser un objeto JSON" });
  }

  const { nombre, apellido, email, password, rol } = req.body;
  if (!nombre || !apellido || !email || !password || !rol) {
    return res.status(400).json({
      error: "nombre, apellido, email, password y rol son obligatorios"
    });
  }

  try {
    const usuario = await prisma.usuario.create({
      data: await datosUsuario(req.body),
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "El cuerpo de la solicitud debe ser un objeto JSON" });
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: await datosUsuario(req.body),
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }

  try {
    await prisma.usuario.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };