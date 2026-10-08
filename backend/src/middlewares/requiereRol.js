const PERMISOS_POR_ROL = {
  administrador: ["leer", "crear", "editar", "eliminar"],
  analista: ["leer", "crear"],
  supervisor: ["leer", "editar"]
};

function requiereRol(rolesPermitidos) {
  const roles = Array.isArray(rolesPermitidos)
    ? rolesPermitidos.map((rol) => String(rol).trim().toLowerCase())
    : [String(rolesPermitidos).trim().toLowerCase()];

  return function (req, res, next) {
    if (!req.usuario || !req.usuario.rol) {
      return res.status(401).json({
        error: "Debes iniciar sesión para realizar esta acción"
      });
    }

    const rolUsuario = String(req.usuario.rol).trim().toLowerCase();

    if (!roles.includes(rolUsuario)) {
      return res.status(403).json({
        error: "No tienes permisos para esta acción"
      });
    }

    next();
  };
}

function requierePermiso(accion) {
  const accionNormalizada = String(accion).trim().toLowerCase();

  return function (req, res, next) {
    if (!req.usuario || !req.usuario.rol) {
      return res.status(401).json({
        error: "Debes iniciar sesión para realizar esta acción"
      });
    }

    const rolUsuario = String(req.usuario.rol).trim().toLowerCase();
    const permisos = PERMISOS_POR_ROL[rolUsuario] || [];

    if (!permisos.includes(accionNormalizada)) {
      return res.status(403).json({
        error: `Tu rol (${req.usuario.rol}) no tiene permisos para ${accionNormalizada}`
      });
    }

    next();
  };
}

module.exports = { requiereRol, requierePermiso };