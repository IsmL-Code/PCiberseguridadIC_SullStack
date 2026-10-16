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

module.exports = { mensajeTextoInvalido, mensajeContenidoPeligroso, esContenidoSeguro, esTextoLegible };
