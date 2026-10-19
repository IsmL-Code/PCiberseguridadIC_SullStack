import test from 'node:test';
import assert from 'node:assert/strict';
import { esNombrePersonaValido, esPasswordSegura } from './validacionUsuario.js';

test('acepta nombres reales', () => {
  for (const nombre of ['Ismael', 'María José', "O'Brien", 'Condo Pérez', 'Ana-Lucía']) {
    assert.equal(esNombrePersonaValido(nombre), true, nombre);
  }
});

test('rechaza nombres aleatorios o con palabras reservadas', () => {
  for (const nombre of [
    'fsdfdssfgsge5t34253245234523rteyhtrey635767select',
    'dsfassadfasdf4wertoiu2435piuo cout',
    'select', 'Juan drop', 'asdfgh', 'aaaa', 'x', 'Ismael1'
  ]) {
    assert.equal(esNombrePersonaValido(nombre), false, nombre);
  }
});

test('valida la fortaleza de la contraseña', () => {
  assert.equal(esPasswordSegura('Segura#2026x', { nombre: 'Ismael' }), true);
  for (const clave of ['123code', 'password1!A', 'sinmayus#123', 'SINMINUS#123', 'Sin Espacio#1', 'Ismael#2026Ab']) {
    assert.equal(esPasswordSegura(clave, { nombre: 'Ismael' }), false, clave);
  }
});
