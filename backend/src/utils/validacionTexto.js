const mensajeTextoInvalido = "Debe ser una palabra o frase legible, no una secuencia aleatoria de letras o números.";
const mensajeContenidoPeligroso = "No se permiten etiquetas HTML ni patrones de inyección en este campo.";

const patronesContenidoPeligroso = [
 /<\s*\/?\s*[a-z][^>]*>/iu,
 /\bon[a-z]+\s*=/iu,
 /\b(?:javascript|vbscript)\s*:/iu,
 /\bdata\s*:\s*text\/html/iu,
 /(?:--|\/\*|\*\/)/u,
 /;\s*(?:select|insert|update|delete|drop|alter|create|truncate|exec(?:ute)?|union)\b/iu,
 /\bunion\s+(?:all\s+)?select\b/iu,
 /\bselec(?:t)?\s+from\b/iu,
 /\b(?:select\b[\s\S]*?\bfrom\b|insert\s+into|update\s+\w+\s+set|delete\s+from|drop\s+(?:table|database)|exec(?:ute)?\s*\()/iu,
 /['"`]\s*(?:or|and)\s+['"`]?\w+['"`]?\s*=\s*['"`]?\w+['"`]?/iu,
 /\b(?:or|and)\s+1\s*=\s*1\b/iu
];

function esContenidoSeguro(valor) {
 return !patronesContenidoPeligroso.some((patron) => patron.test(valor));
}

function esTextoLegible(valor) {
 const texto = valor.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
 if (
  !/\p{L}/u.test(texto)
  || /([\p{L}\p{N}])\1{3,}/u.test(texto)
  || /qwerty|asdf|zxcv|qazwsx|123456|654321/u.test(texto)
 ) {
  return false;
 }

 const palabras = texto.match(/[\p{L}\p{N}]+/gu) || [];
 return palabras.every((palabra) => {
  if (palabra.length < 8) {
   return true;
  }

  const letras = [...palabra].filter((caracter) => /\p{L}/u.test(caracter));
  if (letras.length / palabra.length < 0.7) {
   return false;
  }

  const letrasUnicas = new Set(letras);
  if (letrasUnicas.size / letras.length < 0.45) {
   return false;
  }

  const vocales = letras.filter((letra) => "aeiou".includes(letra)).length;
  return vocales / letras.length >= 0.12;
 });
}

const palabrasReservadas = new Set([
 "select", "insert", "update", "delete", "drop", "union", "alter", "create", "truncate", "exec", "execute",
 "where", "from", "table", "database", "script", "null", "undefined", "true", "false", "cout", "cin",
 "printf", "scanf", "echo", "eval", "function", "return", "console", "alert", "admin", "root"
]);

const mensajeNombreInvalido = "Use solo letras, espacios, guion, apóstrofo o punto. No se permiten números, palabras reservadas ni textos aleatorios.";

function esNombrePersonaValido(valor) {
 const texto = String(valor || "").trim();
 if (texto.length < 2 || !/^\p{L}+(?:[ '.-]\p{L}+)*\.?$/u.test(texto)) {
  return false;
 }

 const normalizado = texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
 const palabras = normalizado.match(/\p{L}+/gu) || [];
 return palabras.every((palabra) => !palabrasReservadas.has(palabra) && !/^([a-z])\1+$/u.test(palabra))
  && esContenidoSeguro(texto)
  && esTextoLegible(texto);
}

const mensajePasswordInvalida = "La contraseña debe tener entre 8 y 72 caracteres, con mayúscula, minúscula, número y símbolo, sin espacios ni secuencias comunes.";
const passwordsComunes = /password|contrase|qwerty|asdf|zxcv|123456|abcdef|admin|letmein|12345678/iu;

function esPasswordSegura(valor, datos = {}) {
 const password = String(valor || "");
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
 const parteEmail = String(datos.email || "").split("@")[0].toLowerCase();
 return [datos.nombre, datos.apellido, parteEmail]
  .map((dato) => String(dato || "").trim().toLowerCase())
  .filter((dato) => dato.length >= 3)
  .every((dato) => !minuscula.includes(dato));
}

module.exports = {
 mensajeTextoInvalido,
 mensajeContenidoPeligroso,
 mensajeNombreInvalido,
 mensajePasswordInvalida,
 esContenidoSeguro,
 esTextoLegible,
 esNombrePersonaValido,
 esPasswordSegura
};
