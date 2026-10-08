const router = require("express").Router();
const controller = require("../controllers/usuario.controller");
const { validar } = require("../middlewares/validate.middleware");
const { verificarToken } = require("../middlewares/auth.middleware");
const { requiereRol } = require("../middlewares/requiereRol");
const { validarIdUsuario } = require("../middlewares/usuario.middleware");
const { usuarioSchema, actualizarUsuarioSchema, estadoUsuarioSchema } = require("../schemas/usuario.schema");

router.use(verificarToken);
router.use(requiereRol("administrador"));

router.get("/", controller.listar);
router.get("/:id", validarIdUsuario, controller.obtener);
router.post("/", validar(usuarioSchema), controller.crear);
router.patch("/:id/estado", validarIdUsuario, validar(estadoUsuarioSchema), controller.actualizarEstado);
router.put("/:id", validarIdUsuario, validar(actualizarUsuarioSchema), controller.actualizar);
router.delete("/:id", validarIdUsuario, controller.eliminar);

module.exports = router;