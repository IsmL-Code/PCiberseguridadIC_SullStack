const { after, before, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-with-at-least-32-characters";
process.env.DATABASE_URL ||= "mysql://test:test@127.0.0.1:3306/test_db";

const app = require("../src/app");
const incidenteService = require("../src/services/incidente.service");
const prisma = require("../src/database/prisma");

const datosValidos = {
  tituloIncidente: "Acceso sospechoso a cuenta",
  tipo: "Acceso no autorizado",
  sistemaAfectado: "Portal corporativo",
  descripcion: "Se identificó un inicio de sesión sospechoso desde una ubicación inusual.",
  prioridad: "ALTA",
  estado: "ABIERTO"
};

let registros;
let siguienteId;
let servidor;
let url;
let metodosOriginales;

function crearToken(rol = "Administrador", sub = 7) {
  return jwt.sign({ sub, rol }, process.env.JWT_SECRET, { expiresIn: "5m" });
}

async function solicitar(ruta, opciones = {}, rol = "Administrador") {
  const headers = new Headers(opciones.headers);
  if (rol && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${crearToken(rol)}`);
  }
  return fetch(`${url}${ruta}`, { ...opciones, headers });
}

let estadoUsuario = "ACTIVE";
const findUniqueOriginal = prisma.usuario.findUnique;

before(async () => {
  prisma.usuario.findUnique = async () => ({ status: estadoUsuario });
  metodosOriginales = { ...incidenteService };
  incidenteService.listar = async ({ estado, prioridad }, paginacion) => {
    const filtrados = registros.filter((registro) =>
      (!estado || registro.estado === estado) && (!prioridad || registro.prioridad === prioridad)
    );
    return paginacion
      ? { datos: filtrados.slice(paginacion.skip, paginacion.skip + paginacion.take), total: filtrados.length }
      : filtrados;
  };
  incidenteService.crear = async (datos) => {
    const registro = { ...datos, id: siguienteId++, createdAt: new Date(), usuarioId: 7 };
    registros.push(registro);
    return registro;
  };
  incidenteService.buscarPorId = async (id) => registros.find((registro) => registro.id === id) || null;
  incidenteService.actualizar = async (id, _usuarioId, datos) => {
    const indice = registros.findIndex((registro) => registro.id === id);
    if (indice < 0) {
      throw Object.assign(new Error("No encontrado"), { code: "P2025" });
    }
    registros[indice] = { ...registros[indice], ...datos };
    return registros[indice];
  };
  incidenteService.eliminar = async (id) => {
    const indice = registros.findIndex((registro) => registro.id === id);
    if (indice < 0) {
      throw Object.assign(new Error("No encontrado"), { code: "P2025" });
    }
    registros.splice(indice, 1);
  };
  incidenteService.listarEliminados = async () => registros.filter((registro) => registro.deletedAt);

  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  url = `http://127.0.0.1:${servidor.address().port}/api/incidentes`;
});

beforeEach(() => {
  estadoUsuario = "ACTIVE";
  registros = [];
  siguienteId = 1;
});

after(async () => {
  await new Promise((resolve, reject) => servidor.close((error) => error ? reject(error) : resolve()));
  Object.assign(incidenteService, metodosOriginales);
  prisma.usuario.findUnique = findUniqueOriginal;
  await prisma.$disconnect();
});

test("1. rechaza consulta sin token", async () => {
  const respuesta = await solicitar("/", {}, null);
  assert.equal(respuesta.status, 401);
});

test("2. rechaza token inválido", async () => {
  const respuesta = await solicitar("/", { headers: { Authorization: "Bearer token-invalido" } });
  assert.equal(respuesta.status, 401);
});

test("3. deniega eliminación al rol analista", async () => {
  const respuesta = await solicitar("/1", { method: "DELETE" }, "Analista");
  assert.equal(respuesta.status, 403);
});

test("4. permite consulta autenticada y establece el origen CORS permitido", async () => {
  const respuesta = await solicitar("/", { headers: { Origin: "http://localhost:5173" } });
  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.headers.get("access-control-allow-origin"), "http://localhost:5173");
  assert.deepEqual(await respuesta.json(), []);
});

test("5. realiza creación, consulta, actualización y eliminación autorizadas", async () => {
  const creadoRespuesta = await solicitar("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosValidos)
  });
  assert.equal(creadoRespuesta.status, 201);
  const creado = await creadoRespuesta.json();

  const listaRespuesta = await solicitar("/");
  assert.equal((await listaRespuesta.json()).length, 1);
  const detalleRespuesta = await solicitar(`/${creado.id}`);
  assert.equal(detalleRespuesta.status, 200);

  const actualizadoRespuesta = await solicitar(`/${creado.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...datosValidos, tituloIncidente: "Acceso inusual confirmado" })
  });
  assert.equal(actualizadoRespuesta.status, 200);
  assert.equal((await actualizadoRespuesta.json()).tituloIncidente, "Acceso inusual confirmado");

  const eliminadoRespuesta = await solicitar(`/${creado.id}`, { method: "DELETE" });
  assert.equal(eliminadoRespuesta.status, 204);
  assert.equal(registros.length, 0);
});

test("6. rechaza datos inválidos y no persiste el incidente", async () => {
  const respuesta = await solicitar("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...datosValidos, tituloIncidente: "SELEC FROM #" })
  });
  assert.equal(respuesta.status, 400);
  assert.equal(registros.length, 0);
});

test("7. rechaza filtros de consulta con estados no permitidos", async () => {
  const respuesta = await solicitar("/?estado=INVALIDO");
  assert.equal(respuesta.status, 400);
});

test("8. no autoriza navegadores de orígenes CORS no permitidos", async () => {
  const respuesta = await solicitar("/", { headers: { Origin: "https://sitio-no-autorizado.example" } });
  assert.equal(respuesta.headers.get("access-control-allow-origin"), null);
  assert.equal(respuesta.status, 200);
});

test("9. normaliza el tipo heredado Doss para permitir editar el incidente", async () => {
  const incidenteHeredado = {
    ...datosValidos,
    id: siguienteId++,
    tipo: "Doss",
    createdAt: new Date(),
    usuarioId: 7
  };
  registros.push(incidenteHeredado);

  const listaRespuesta = await solicitar("/");
  assert.equal(listaRespuesta.status, 200);
  assert.equal((await listaRespuesta.json())[0].tipo, "Denegación de servicio");

  const actualizadoRespuesta = await solicitar(`/${incidenteHeredado.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...datosValidos,
      tipo: "Denegación de servicio",
      tituloIncidente: "Ataque de servicio confirmado"
    })
  });
  assert.equal(actualizadoRespuesta.status, 200);
  assert.equal((await actualizadoRespuesta.json()).tipo, "Denegación de servicio");
  assert.equal(registros[0].tipo, "Denegación de servicio");
});

test("10. lista incidentes eliminados solo para el administrador", async () => {
  registros.push({
    ...datosValidos,
    id: 1,
    createdAt: new Date(),
    deletedAt: new Date(),
    usuarioId: 7
  });

  const denegada = await solicitar("/eliminados", {}, "Supervisor");
  assert.equal(denegada.status, 403);

  const respuesta = await solicitar("/eliminados");
  assert.equal(respuesta.status, 200);
  const lista = await respuesta.json();
  assert.equal(lista.length, 1);
  assert.match(lista[0].fechaEliminacion, /^\d{4}-\d{2}-\d{2}$/);
});

function crearCookieSesion(csrf = "csrf-de-prueba") {
  const token = jwt.sign({ sub: 7, rol: "Administrador", csrf }, process.env.JWT_SECRET, { expiresIn: "5m" });
  return `authToken=${token}`;
}

test("11. con cookie de sesión rechaza escrituras sin token CSRF", async () => {
  const respuesta = await solicitar("/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: crearCookieSesion() },
    body: JSON.stringify(datosValidos)
  }, null);
  assert.equal(respuesta.status, 403);
  assert.equal(registros.length, 0);
});

test("12. con cookie de sesión rechaza un token CSRF incorrecto", async () => {
  const respuesta = await solicitar("/1", {
    method: "DELETE",
    headers: { Cookie: crearCookieSesion(), "X-CSRF-Token": "otro-valor" }
  }, null);
  assert.equal(respuesta.status, 403);
});

test("13. con cookie de sesión y token CSRF correcto permite escribir; las lecturas no lo exigen", async () => {
  const lectura = await solicitar("/", { headers: { Cookie: crearCookieSesion() } }, null);
  assert.equal(lectura.status, 200);

  const escritura = await solicitar("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: crearCookieSesion(),
      "X-CSRF-Token": "csrf-de-prueba"
    },
    body: JSON.stringify(datosValidos)
  }, null);
  assert.equal(escritura.status, 201);
});

test("14. bloquea escrituras desde un origen no permitido aunque haya sesión", async () => {
  const respuesta = await solicitar("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: crearCookieSesion(),
      "X-CSRF-Token": "csrf-de-prueba",
      Origin: "https://sitio-malicioso.example"
    },
    body: JSON.stringify(datosValidos)
  }, null);
  assert.equal(respuesta.status, 403);
  assert.equal(registros.length, 0);
});


test("15. un usuario suspendido pierde el acceso aunque su token siga vigente", async () => {
  estadoUsuario = "SUSPENDED";
  const respuesta = await solicitar("/");
  assert.equal(respuesta.status, 401);
});


test("16. un token revocado al cerrar sesion deja de ser valido", async () => {
  const { revocarToken } = require("../src/utils/tokensRevocados");
  const token = jwt.sign({ sub: 7, rol: "Administrador" }, process.env.JWT_SECRET, { expiresIn: "5m", jwtid: "jti-de-prueba" });
  const antes = await solicitar("/", { headers: { Cookie: `authToken=${token}` } }, null);
  assert.equal(antes.status, 200);

  revocarToken("jti-de-prueba", Math.floor(Date.now() / 1000) + 300);
  const despues = await solicitar("/", { headers: { Cookie: `authToken=${token}` } }, null);
  assert.equal(despues.status, 401);
});

test("17. la paginacion del servidor limita filas y devuelve el total", async () => {
  for (let i = 0; i < 3; i++) {
    await solicitar("/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datosValidos) });
  }
  const respuesta = await solicitar("/?pagina=2&limite=2");
  assert.equal(respuesta.status, 200);
  const cuerpo = await respuesta.json();
  assert.equal(cuerpo.datos.length, cuerpo.total - 2);
  assert.equal(cuerpo.pagina, 2);
  assert.equal(cuerpo.limite, 2);
  assert.equal(cuerpo.totalPaginas, Math.ceil(cuerpo.total / 2));

  const limitado = await (await solicitar("/?pagina=1&limite=9999")).json();
  assert.equal(limitado.limite, 100);
});