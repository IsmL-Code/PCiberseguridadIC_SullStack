const usuarioService = require("../services/usuario.service");

function obtenerIdValido(id) {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listar();
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
    const usuario = await usuarioService.buscarPorId(id);

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
    const usuario = await usuarioService.crear(req.body);
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
    const usuario = await usuarioService.actualizar(id, req.body);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

async function actualizarEstado(req, res, next) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }

  try {
    const usuario = await usuarioService.actualizarEstado(id, req.body.status);
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
    await usuarioService.eliminar(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, actualizarEstado, eliminar };