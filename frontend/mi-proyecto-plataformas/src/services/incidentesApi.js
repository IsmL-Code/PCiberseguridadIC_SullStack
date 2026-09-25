const API_URL = "http://localhost:3000/incidentes"; //[cite: 5]

async function procesarRespuesta(respuesta, mensajeError) {
  if (!respuesta.ok) {
    let detalle = "";
    try {
      const cuerpo = await respuesta.json();
      detalle = cuerpo.error ? `: ${cuerpo.error}` : "";
    } catch {
      // La respuesta puede no tener un cuerpo JSON.
    }
    throw new Error(`${mensajeError}${detalle}`);
  }

  return respuesta.status === 204 ? null : respuesta.json();
}

export async function obtenerIncidentes() { //[cite: 5]
  const respuesta = await fetch(API_URL); //[cite: 5]
  return procesarRespuesta(respuesta, "No se pudo obtener la lista de incidentes");
}

export async function obtenerIncidentePorId(id) {
  const respuesta = await fetch(`${API_URL}/${id}`);
  return procesarRespuesta(respuesta, "No se pudo obtener el incidente");
}

// Nueva función para enviar el nuevo registro al backend
export async function crearIncidente(datosNuevoIncidente) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datosNuevoIncidente)
  });

  return procesarRespuesta(respuesta, "Error al crear el nuevo incidente");
}

export async function actualizarIncidente(id, datosIncidente) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datosIncidente)
  });

  return procesarRespuesta(respuesta, "Error al actualizar el incidente");
}

export async function eliminarIncidente(id) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  return procesarRespuesta(respuesta, "Error al eliminar el incidente");
}