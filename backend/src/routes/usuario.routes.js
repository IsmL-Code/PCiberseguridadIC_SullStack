const router = require("express").Router();
const controller = require("../controllers/usuario.controller");
const {
  validarIdUsuario,
  validarUsuario
} = require("../middlewares/usuario.middleware");

router.get("/", controller.listar);
router.get("/:id", validarIdUsuario, controller.obtener);
router.post("/", validarUsuario, controller.crear);
router.put("/:id", validarIdUsuario, validarUsuario, controller.actualizar);
router.delete("/:id", validarIdUsuario, controller.eliminar);

module.exports = router;