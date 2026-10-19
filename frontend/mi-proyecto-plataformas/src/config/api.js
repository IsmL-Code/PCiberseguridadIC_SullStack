// En desarrollo apunta a localhost; en producción usa VITE_API_URL o, si no existe, el mismo origen.
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');
