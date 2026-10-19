const NOMBRE_COOKIE_SESION = "authToken";
const DURACION_SESION_MS = 2 * 60 * 60 * 1000;
const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);

function obtenerSameSite() {
  const valor = String(process.env.COOKIE_SAMESITE || "strict").toLowerCase();
  if (!["strict", "lax", "none"].includes(valor)) {
    throw new Error("COOKIE_SAMESITE debe ser strict, lax o none");
  }
  if (valor === "none" && process.env.NODE_ENV !== "production") {
    return "lax";
  }
  return valor;
}

// Con frontend y API en dominios distintos usa COOKIE_SAMESITE=none (requiere HTTPS)
function opcionesCookieSesion() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: obtenerSameSite(),
    path: "/"
  };
}

function leerCookie(req, nombre) {
  const encabezado = req.headers.cookie;
  if (!encabezado) {
    return null;
  }

  for (const par of encabezado.split(";")) {
    const indice = par.indexOf("=");
    if (indice < 0 || par.slice(0, indice).trim() !== nombre) {
      continue;
    }
    try {
      return decodeURIComponent(par.slice(indice + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

module.exports = {
  NOMBRE_COOKIE_SESION,
  DURACION_SESION_MS,
  METODOS_SEGUROS,
  opcionesCookieSesion,
  leerCookie
};
