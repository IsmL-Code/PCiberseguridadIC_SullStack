const incidenteService = require("../services/incidente.service");

function obtenerIdValido(id) {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

function seleccionarIncidente(incidente) {
  return {
    ...incidente,
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
    estado: body.estado,
    evidencia: body.evidencia || null
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
    const incidentes = await incidenteService.listar({
      usuarioId: Number(req.usuario.sub),
      estado,
      prioridad
    });
    res.json(incidentes.map(seleccionarIncidente));
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
      Number(req.usuario.sub)
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
      datosIncidente(req.body)
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
    await incidenteService.eliminar(id, Number(req.usuario.sub));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };