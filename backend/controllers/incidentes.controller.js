const modelo = require("../models/incidentes.model");

function responderError(res, estado, mensaje) {
  return res.status(estado).json({ error: mensaje });
}

function obtenerIdValido(id) {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

function listar(req, res) {
  res.json(modelo.listar());
}

function obtener(req, res) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return responderError(res, 400, "El id debe ser un entero positivo");
  }

  const incidente = modelo.buscarPorId(id);
  if (!incidente) {
    return responderError(res, 404, "Incidente no encontrado");
  }
  res.json(incidente);
}

function crear(req, res) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return responderError(res, 400, "El cuerpo de la solicitud debe ser un objeto JSON");
  }

  const { tipo, prioridad } = req.body;

  if (!tipo || !prioridad) {
    return responderError(res, 400, "tipo y prioridad son obligatorios");
  }

  const nuevo = modelo.crear({
    ...req.body,
    estado: req.body.estado || "Registrado"
  });

  res.status(201).json(nuevo);
}

function actualizar(req, res) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return responderError(res, 400, "El id debe ser un entero positivo");
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return responderError(res, 400, "El cuerpo de la solicitud debe ser un objeto JSON");
  }

  const incidente = modelo.actualizar(id, req.body);
  if (!incidente) {
    return responderError(res, 404, "Incidente no encontrado");
  }
  res.json(incidente);
}

function eliminar(req, res) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return responderError(res, 400, "El id debe ser un entero positivo");
  }

  const ok = modelo.eliminar(id);
  if (!ok) {
    return responderError(res, 404, "Incidente no encontrado");
  }
  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };