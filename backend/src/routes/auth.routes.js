const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const { validarCredenciales } = require("../middlewares/auth.middleware");

const { limitarLogin } = require("../middlewares/limitarLogin.middleware");

router.post("/login", limitarLogin, validarCredenciales, controller.iniciarSesion);
router.post("/logout", controller.cerrarSesion);

module.exports = router;