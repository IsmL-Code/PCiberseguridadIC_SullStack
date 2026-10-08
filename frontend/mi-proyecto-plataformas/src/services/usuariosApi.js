const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/usuarios`;

function encabezadosAutenticacion() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function procesarRespuesta(respuesta, mensajeError) {
  if (!respuesta.ok) {
    let detalle = "";
    try {
      const cuerpo = await respuesta.json();
      detalle = cuerpo.error ? `: ${cuerpo.error}` : "";
      if (cuerpo.detalles?.length) {
        detalle += ` (${cuerpo.detalles.map((item) => `${item.campo}: ${item.mensaje}`).join(", ")})`;
      }
    } catch {
      // La respuesta puede no tener un cuerpo JSON.
    }
    throw new Error(`${mensajeError}${detalle}`);
  }

  return respuesta.status === 204 ? null : respuesta.json();
}

export async function listarUsuarios() {
  const respuesta = await fetch(API_URL, { headers: encabezadosAutenticacion() });
  return procesarRespuesta(respuesta, "No se pudo obtener la lista de usuarios");
}

export async function crearUsuario(datosUsuario) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...encabezadosAutenticacion() },
    body: JSON.stringify(datosUsuario)
  });

  return procesarRespuesta(respuesta, "No se pudo registrar el usuario");
}

export async function actualizarUsuario(id, datosUsuario) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...encabezadosAutenticacion() },
    body: JSON.stringify(datosUsuario)
  });

  return procesarRespuesta(respuesta, "No se pudo modificar el usuario");
}

export async function actualizarEstadoUsuario(id, status) {
  const respuesta = await fetch(`${API_URL}/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...encabezadosAutenticacion() },
    body: JSON.stringify({ status })
  });

  return procesarRespuesta(respuesta, "No se pudo modificar el estado del usuario");
}

export async function eliminarUsuario(id) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: encabezadosAutenticacion()
  });

  return procesarRespuesta(respuesta, "No se pudo eliminar el usuario");
}
