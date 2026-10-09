const { after, before, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-with-at-least-32-characters";
process.env.DATABASE_URL ||= "mysql://test:test@127.0.0.1:3306/test_db";

const app = require("../src/app");
const incidenteService = require("../src/services/incidente.service");
const prisma = require("../src/config/prisma");

const datosValidos = {
  tituloIncidente: "Acceso sospechoso a cuenta",
  tipo: "Acceso no autorizado",
  sistemaAfectado: "Portal corporativo",
  descripcion: "Se identificó un inicio de sesión sospechoso desde una ubicación inusual.",
  prioridad: "ALTA",
  estado: "ABIERTO",
  evidencia: "captura-login.png"
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

before(async () => {
  metodosOriginales = { ...incidenteService };
  incidenteService.listar = async ({ estado, prioridad }) => registros.filter((registro) =>
    (!estado || registro.estado === estado) && (!prioridad || registro.prioridad === prioridad)
  );
  incidenteService.crear = async (datos) => {
    const registro = { ...datos, id: siguienteId++, createdAt: new Date(), usuarioId: 7 };
    registros.push(registro);
    return registro;
  };
  incidenteService.buscarPorId = async (id) => registros.find((registro) => registro.id === id) || null;
  incidenteService.actualizar = async (id, _usuarioId, datos) => {
    const indice = registros.findIndex((registro) => registro.id === id);
    if (indice < 0) throw Object.assign(new Error("No encontrado"), { code: "P2025" });
    registros[indice] = { ...registros[indice], ...datos };
    return registros[indice];
  };
  incidenteService.eliminar = async (id) => {
    const indice = registros.findIndex((registro) => registro.id === id);
    if (indice < 0) throw Object.assign(new Error("No encontrado"), { code: "P2025" });
    registros.splice(indice, 1);
  };

  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  url = `http://127.0.0.1:${servidor.address().port}/api/incidentes`;
});

beforeEach(() => {
  registros = [];
  siguienteId = 1;
});

after(async () => {
  await new Promise((resolve, reject) => servidor.close((error) => error ? reject(error) : resolve()));
  Object.assign(incidenteService, metodosOriginales);
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
