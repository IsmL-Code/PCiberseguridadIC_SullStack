import assert from 'node:assert/strict';
import test from 'node:test';
import { paginar } from './paginacion.js';

const datos = Array.from({ length: 25 }, (_, i) => i + 1);

test('devuelve la primera pagina con 15 elementos', () => {
  const r = paginar(datos, 1);
  assert.equal(r.items.length, 15);
  assert.equal(r.totalPaginas, 2);
  assert.equal(r.items[0], 1);
});

test('la ultima pagina contiene el resto', () => {
  assert.deepEqual(paginar(datos, 2).items, [16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
});

test('ajusta paginas fuera de rango y listas vacias', () => {
  assert.equal(paginar(datos, 99).pagina, 2);
  assert.equal(paginar(datos, -4).pagina, 1);
  assert.deepEqual(paginar([], 5), { pagina: 1, totalPaginas: 1, items: [] });
});
