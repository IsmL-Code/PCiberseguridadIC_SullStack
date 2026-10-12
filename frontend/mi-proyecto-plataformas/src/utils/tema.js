export const CLAVE_TEMA = "tema";
export const TEMAS = ["light", "dark"];
export const TEMA_PREDETERMINADO = "light";

export function normalizarTema(valor) {
  return TEMAS.includes(valor) ? valor : TEMA_PREDETERMINADO;
}

export function obtenerTemaGuardado(storage = localStorage) {
  try {
    return normalizarTema(storage.getItem(CLAVE_TEMA));
  } catch {
    return TEMA_PREDETERMINADO;
  }
}

export function guardarTema(tema, storage = localStorage) {
  try {
    storage.setItem(CLAVE_TEMA, normalizarTema(tema));
  } catch {
    // Sin almacenamiento disponible el tema sigue aplicándose en la sesión actual
  }
}

export function aplicarTema(tema, raiz = document.documentElement) {
  raiz.setAttribute("data-theme", normalizarTema(tema));
}
