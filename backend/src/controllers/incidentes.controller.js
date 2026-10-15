const incidenteService = require("../services/incidente.service");
const { registrarAuditoria } = require("../utils/auditoria");
const { leerPaginacion, respuestaPaginada } = require("../utils/paginacion");

const tiposIncidenteLegacy = {
  doss: "Denegación de servicio"
};

function obtenerIdValido(id) {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

function seleccionarIncidente(incidente) {
  return {
    ...incidente,
    tipo: tiposIncidenteLegacy[incidente.tipo?.trim().toLocaleLowerCase("es")] || incidente.tipo,
    fechaCreacion: incidente.createdAt.toISOString().slice(0, 10)
  };
}

function datosIncidente(body) {
  return {
    tituloIncidente: body.tituloIncidente,
    tipo: body.tipo,
    sistemaAfectado: body.sistemaAfectado || null,
    descripcion: body.descripcion,
    prioridad: body.prioridad,
    estado: body.estado
  };
}

async function listar(req, res, next) {
  const prioridades = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
  const estados = ["ABIERTO", "EN_PROCESO", "CERRADO"];
  const { estado, prioridad } = req.query;

  if (estado && !estados.includes(estado)) {
    return res.status(400).json({
      error: "El estado debe ser ABIERTO, EN_PROCESO o CERRADO"
    });
  }

  if (prioridad && !prioridades.includes(prioridad)) {
    return res.status(400).json({
      error: "La prioridad debe ser BAJA, MEDIA, ALTA o CRITICA"
    });
  }

  try {
    const paginacion = leerPaginacion(req.query);
    const resultado = await incidenteService.listar({
      usuarioId: Number(req.usuario.sub),
      rol: req.usuario.rol,
      estado,
      prioridad
    }, paginacion);
    const datos = (paginacion ? resultado.datos : resultado).map(seleccionarIncidente);
    res.json(paginacion ? respuestaPaginada(datos, resultado.total, paginacion) : datos);
  } catch (error) {
    next(error);
  }
}

async function listarEliminados(req, res, next) {
  try {
    const paginacion = leerPaginacion(req.query);
    const resultado = await incidenteService.listarEliminados(paginacion);
    const datos = (paginacion ? resultado.datos : resultado).map((incidente) => ({
      ...seleccionarIncidente(incidente),
      fechaEliminacion: incidente.deletedAt.toISOString().slice(0, 10)
    }));
    res.json(paginacion ? respuestaPaginada(datos, resultado.total, paginacion) : datos);
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
    const incidente = await incidenteService.buscarPorId(
      id,
      Number(req.usuario.sub),
      req.usuario.rol
    );
    if (!incidente) {
      return res.status(404).json({ error: "Incidente no encontrado" });
    }
    res.json(seleccionarIncidente(incidente));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const incidente = await incidenteService.crear({
      ...datosIncidente(req.body),
      usuarioId: Number(req.usuario.sub)
    });
    res.status(201).json(seleccionarIncidente(incidente));
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  const id = obtenerIdValido(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }

  try {
    const incidente = await incidenteService.actualizar(
      id,
      Number(req.usuario.sub),
      datosIncidente(req.body),
      req.usuario.rol
    );
    res.json(seleccionarIncidente(incidente));
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
    await incidenteService.eliminar(id, Number(req.usuario.sub), req.usuario.rol);
    registrarAuditoria("incidente_eliminado", { incidenteId: id, usuarioId: Number(req.usuario.sub) });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, listarEliminados, obtener, crear, actualizar, eliminar };