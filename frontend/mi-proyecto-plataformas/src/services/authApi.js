const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth`;

export async function iniciarSesion(email, password) {
  const respuesta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const cuerpo = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(cuerpo.error || "No fue posible iniciar sesión");
  }

  return cuerpo;
}