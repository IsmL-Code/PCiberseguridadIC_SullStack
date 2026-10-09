import { fetchConSesion } from "./fetchConSesion";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/incidentes`;

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

export async function obtenerIncidentes(filtros = {}) { //[cite: 5]
  const parametros = new URLSearchParams();
  if (filtros.estado) parametros.set("estado", filtros.estado);
  if (filtros.prioridad) parametros.set("prioridad", filtros.prioridad);
  const query = parametros.toString();
  const respuesta = await fetchConSesion(`${API_URL}${query ? `?${query}` : ""}`, { headers: encabezadosAutenticacion() }); //[cite: 5]
  return procesarRespuesta(respuesta, "No se pudo obtener la lista de incidentes");
}

export async function obtenerIncidentePorId(id) {
  const respuesta = await fetchConSesion(`${API_URL}/${id}`, { headers: encabezadosAutenticacion() });
  return procesarRespuesta(respuesta, "No se pudo obtener el incidente");
}

// Nueva función para enviar el nuevo registro al backend
export async function crearIncidente(datosNuevoIncidente) {
  const respuesta = await fetchConSesion(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...encabezadosAutenticacion() },
    body: JSON.stringify(datosNuevoIncidente)
  });

  return procesarRespuesta(respuesta, "Error al crear el nuevo incidente");
}

export async function actualizarIncidente(id, datosIncidente) {
  const respuesta = await fetchConSesion(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...encabezadosAutenticacion() },
    body: JSON.stringify(datosIncidente)
  });

  return procesarRespuesta(respuesta, "Error al actualizar el incidente");
}

export async function eliminarIncidente(id) {
  const respuesta = await fetchConSesion(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: encabezadosAutenticacion()
  });

  return procesarRespuesta(respuesta, "Error al eliminar el incidente");
}