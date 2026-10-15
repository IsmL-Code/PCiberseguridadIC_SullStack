export const TAMANO_PAGINA = 15;

export function paginar(elementos, pagina, tamano = TAMANO_PAGINA) {
  const totalPaginas = Math.max(1, Math.ceil(elementos.length / tamano));
  const actual = Math.min(Math.max(1, Number(pagina) || 1), totalPaginas);
  const inicio = (actual - 1) * tamano;
  return {
    pagina: actual,
    totalPaginas,
    items: elementos.slice(inicio, inicio + tamano)
  };
}
