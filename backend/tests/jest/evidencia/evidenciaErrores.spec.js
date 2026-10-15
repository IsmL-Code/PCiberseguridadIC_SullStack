// EVIDENCIA: estas pruebas tienen expectativas incorrectas a proposito y deben FALLAR.
// Sirven para demostrar que la suite detecta errores. Ejecutar con: npm run test:jest:evidencia
jest.mock("../../../src/database/prisma", () => ({
  incidente: { findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
  $transaction: jest.fn((consultas) => Promise.all(consultas))
}));

const prisma = require("../../../src/database/prisma");
const incidenteService = require("../../../src/services/incidente.service");
const { leerPaginacion } = require("../../../src/utils/paginacion");

describe("Simulacion de errores (deben FALLAR 2)", () => {
  test("FALLA 1: un usuario normal NO deberia filtrar por usuarioId (incorrecto)", async () => {
    await incidenteService.listar({ usuarioId: 7, rol: "Usuario" });

    const { where } = prisma.incidente.findMany.mock.calls[0][0];
    expect(where).not.toHaveProperty("usuarioId");
  });

  test("FALLA 2: el limite maximo deberia ser 500 (incorrecto, es 100)", () => {
    expect(leerPaginacion({ pagina: "1", limite: "500" }).limite).toBe(500);
  });
});
