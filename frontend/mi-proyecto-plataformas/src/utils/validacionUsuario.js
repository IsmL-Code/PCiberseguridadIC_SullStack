const palabrasReservadas = new Set([
  'select', 'insert', 'update', 'delete', 'drop', 'union', 'alter', 'create', 'truncate', 'exec', 'execute',
  'where', 'from', 'table', 'database', 'script', 'null', 'undefined', 'true', 'false', 'cout', 'cin',
  'printf', 'scanf', 'echo', 'eval', 'function', 'return', 'console', 'alert', 'admin', 'root'
]);

export const mensajeNombreInvalido = 'Use solo letras, espacios, guion, apóstrofo o punto. No se permiten números, palabras reservadas ni textos aleatorios.';
export const mensajePasswordInvalida = 'La contraseña debe tener entre 8 y 72 caracteres, con mayúscula, minúscula, número y símbolo, sin espacios ni secuencias comunes.';

function esTextoLegible(valor) {
  const texto = valor.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (
    !/\p{L}/u.test(texto)
    || /([\p{L}\p{N}])\1{3,}/u.test(texto)
    || /qwerty|asdf|zxcv|qazwsx|123456|654321/u.test(texto)
  ) {
    return false;
  }

  const palabras = texto.match(/[\p{L}\p{N}]+/gu) || [];
  return palabras.every((palabra) => {
    if (palabra.length < 8) return true;
    const letras = [...palabra].filter((caracter) => /\p{L}/u.test(caracter));
    if (letras.length / palabra.length < 0.7) return false;
    if (new Set(letras).size / letras.length < 0.45) return false;
    const vocales = letras.filter((letra) => 'aeiou'.includes(letra)).length;
    return vocales / letras.length >= 0.12;
  });
}

export function esNombrePersonaValido(valor) {
  const texto = String(valor || '').trim();
  if (texto.length < 2 || !/^\p{L}+(?:[ '.-]\p{L}+)*\.?$/u.test(texto)) return false;

  const normalizado = texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const palabras = normalizado.match(/\p{L}+/gu) || [];
  return palabras.every((palabra) => !palabrasReservadas.has(palabra) && !/^([a-z])\1+$/u.test(palabra))
    && esTextoLegible(texto);
}

const passwordsComunes = /password|contrase|qwerty|asdf|zxcv|123456|abcdef|admin|letmein|12345678/iu;

export function esPasswordSegura(valor, datos = {}) {
  const password = String(valor || '');
  if (
    password.length < 8
    || password.length > 72
    || /\s/u.test(password)
    || !/\p{Ll}/u.test(password)
    || !/\p{Lu}/u.test(password)
    || !/\p{N}/u.test(password)
    || !/[^\p{L}\p{N}\s]/u.test(password)
    || /(.)\1{3,}/u.test(password)
    || passwordsComunes.test(password)
  ) {
    return false;
  }

  const minuscula = password.toLowerCase();
  const parteEmail = String(datos.email || '').split('@')[0].toLowerCase();
  return [datos.nombre, datos.apellido, parteEmail]
    .map((dato) => String(dato || '').trim().toLowerCase())
    .filter((dato) => dato.length >= 3)
    .every((dato) => !minuscula.includes(dato));
}
