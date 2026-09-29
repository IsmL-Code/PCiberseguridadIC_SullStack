function validarIdUsuario(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un entero positivo" });
  }

  next();
}

function validarUsuario(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "El cuerpo de la solicitud debe ser un objeto JSON"
    });
  }

  const camposObligatorios = ["nombre", "apellido", "email", "password", "rol"];
  const camposFaltantes = camposObligatorios.filter((campo) => {
    const valor = req.body[campo];
    return typeof valor !== "string" || valor.trim() === "";
  });

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios",
      campos: camposFaltantes
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  if (req.body.password.length < 8) {
    return res.status(400).json({
      error: "La contraseña debe tener al menos 8 caracteres"
    });
  }

  req.body = {
    nombre: req.body.nombre.trim(),
    apellido: req.body.apellido.trim(),
    email: req.body.email.trim().toLowerCase(),
    password: req.body.password,
    rol: req.body.rol.trim()
  };

  next();
}

module.exports = { validarIdUsuario, validarUsuario };