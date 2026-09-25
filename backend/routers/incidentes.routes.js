const express = require("express");
const router = express.Router();
const controlador = require("../controllers/incidentes.controller");
 
router.get("/", controlador.listar);
router.get("/:id", controlador.obtener);
router.post("/", controlador.crear);
router.put("/:id", controlador.actualizar);
router.delete("/:id", controlador.eliminar);
 
module.exports = router;