const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const { validarCredenciales } = require("../middlewares/auth.middleware");

router.post("/login", validarCredenciales, controller.iniciarSesion);

module.exports = router;