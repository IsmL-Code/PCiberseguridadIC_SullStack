jest.mock("../../src/database/prisma", () => ({
  incidente: { findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
  $transaction: jest.fn((consultas) => Promise.all(consultas))
}));

const prisma = require("../../src/database/prisma");
const incidenteService = require("../../src/services/incidente.service");
const { leerPaginacion, respuestaPaginada } = require("../../src/utils/paginacion");

beforeEach(() => jest.clearAllMocks());

describe("Regla 1: visibilidad de incidentes segun rol", () => {
  test("un usuario normal solo ve sus incidentes no eliminados", async () => {
    await incidenteService.listar({ usuarioId: 7, rol: "Usuario" });

    expect(prisma.incidente.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { estado: undefined, prioridad: undefined, deletedAt: null, usuarioId: 7 } })
    );
  });

  test.each(["Administrador", " supervisor "])("el rol %p ve incidentes de todos", async (rol) => {
    await incidenteService.listar({ usuarioId: 7, rol, estado: "abierto" });

    const { where } = prisma.incidente.findMany.mock.calls[0][0];
    expect(where).not.toHaveProperty("usuarioId");
    expect(where).toMatchObject({ estado: "abierto", deletedAt: null });
  });
});

describe("Regla 2: el borrado es logico y limitado por rol", () => {
  test("marca deletedAt en lugar de borrar el registro", async () => {
    await incidenteService.eliminar(3, 7, "Administrador");

    const { where, data } = prisma.incidente.update.mock.calls[0][0];
    expect(where).toEqual({ id: 3, deletedAt: null });
    expect(data.deletedAt).toBeInstanceOf(Date);
  });

  test("un supervisor o usuario solo elimina sus propios incidentes", async () => {
    await incidenteService.eliminar(3, 7, "supervisor");

    expect(prisma.incidente.update.mock.calls[0][0].where).toEqual({ id: 3, usuarioId: 7, deletedAt: null });
  });
});

describe("Regla 3: paginacion acotada", () => {
  test("sin parametros no pagina; con parametros limita a 100 y a minimo 1", () => {
    expect(leerPaginacion({})).toBeNull();
    expect(leerPaginacion({ pagina: "3", limite: "500" })).toMatchObject({ pagina: 3, limite: 100, skip: 200, take: 100 });
    expect(leerPaginacion({ pagina: "-4", limite: "abc" })).toMatchObject({ pagina: 1, limite: 15, skip: 0 });
  });

  test("calcula el total de paginas y el servicio consulta con skip/take", async () => {
    prisma.incidente.findMany.mockResolvedValue([{ id: 1 }]);
    prisma.incidente.count.mockResolvedValue(31);
    const pag = leerPaginacion({ pagina: "2", limite: "15" });

    const { datos, total } = await incidenteService.listarEliminados(pag);

    expect(prisma.incidente.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 15, take: 15 }));
    expect(respuestaPaginada(datos, total, pag)).toMatchObject({ pagina: 2, total: 31, totalPaginas: 3 });
  });
});
