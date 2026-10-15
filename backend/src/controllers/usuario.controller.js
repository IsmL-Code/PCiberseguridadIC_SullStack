const usuarioService = require("../services/usuario.service");
const { registrarAuditoria } = require("../utils/auditoria");
const { leerPaginacion, respuestaPaginada } = require("../utils/paginacion");

async function listar(req, res, next) {
  try {
    const paginacion = leerPaginacion(req.query);
    const resultado = await usuarioService.listar(paginacion);
    res.json(paginacion ? respuestaPaginada(resultado.datos, resultado.total, paginacion) : resultado);
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  const id = Number(req.params.id);

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
  try {
    const usuario = await usuarioService.crear(req.body);
    registrarAuditoria("usuario_creado", { usuarioId: usuario.id, rol: usuario.rol, porUsuarioId: Number(req.usuario?.sub) });
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  const id = Number(req.params.id);

  try {
    const usuario = await usuarioService.actualizar(id, req.body);
    registrarAuditoria("usuario_actualizado", { usuarioId: id, rol: usuario.rol, porUsuarioId: Number(req.usuario?.sub) });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

async function actualizarEstado(req, res, next) {
  const id = Number(req.params.id);

  try {
    const usuario = await usuarioService.actualizarEstado(id, req.body.status);
    registrarAuditoria("usuario_estado_cambiado", { usuarioId: id, status: req.body.status, porUsuarioId: Number(req.usuario?.sub) });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  const id = Number(req.params.id);

  try {
    await usuarioService.eliminar(id);
    registrarAuditoria("usuario_eliminado", { usuarioId: id, porUsuarioId: Number(req.usuario?.sub) });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, actualizarEstado, eliminar };