const router = require("express").Router();
const controller = require("../controllers/incidentes.controller");
const { validar } = require("../middlewares/validate.middleware");
const { verificarToken } = require("../middlewares/auth.middleware");
const { requierePermiso } = require("../middlewares/requiereRol");
const { incidenteSchema } = require("../schemas/incidente.schema");

router.use(verificarToken);

router.get("/", requierePermiso("leer"), controller.listar);
router.get("/:id", requierePermiso("leer"), controller.obtener);
router.post("/", requierePermiso("crear"), validar(incidenteSchema), controller.crear);
router.put("/:id", requierePermiso("editar"), validar(incidenteSchema), controller.actualizar);
router.delete("/:id", requierePermiso("eliminar"), controller.eliminar);

module.exports = router;