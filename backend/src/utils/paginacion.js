const LIMITE_POR_DEFECTO = 15;
const LIMITE_MAXIMO = 100;

// Devuelve null si el cliente no pidio paginacion (se mantiene la respuesta en arreglo)
function leerPaginacion(query = {}) {
  if (query.pagina === undefined && query.limite === undefined) return null;

  const pagina = Math.max(1, parseInt(query.pagina, 10) || 1);
  const limite = Math.min(LIMITE_MAXIMO, Math.max(1, parseInt(query.limite, 10) || LIMITE_POR_DEFECTO));
  return { pagina, limite, skip: (pagina - 1) * limite, take: limite };
}

function respuestaPaginada(datos, total, { pagina, limite }) {
  return { datos, pagina, limite, total, totalPaginas: Math.max(1, Math.ceil(total / limite)) };
}

// Evita el count cuando la primera página no se llena: el total ya es el número de filas devueltas
async function paginarConTotal(delegado, consulta, { skip, take }) {
  const datos = await delegado.findMany({ ...consulta, skip, take });
  if (skip === 0 && datos.length < take) return { datos, total: datos.length };
  const total = await delegado.count({ where: consulta.where });
  return { datos, total };
}

module.exports = { leerPaginacion, respuestaPaginada, paginarConTotal };
