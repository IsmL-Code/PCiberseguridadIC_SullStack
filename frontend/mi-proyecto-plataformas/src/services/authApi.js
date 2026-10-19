import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/auth`;

export async function iniciarSesion(email, password) {
  const respuesta = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const cuerpo = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(cuerpo.error || "No fue posible iniciar sesión");
  }

  return cuerpo;
}

export async function cerrarSesionEnServidor() {
  try {
    await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
  } catch {
    // Si el servidor no responde, igualmente se limpia la sesión local.
  }
}