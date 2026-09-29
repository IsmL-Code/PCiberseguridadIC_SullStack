const { z } = require("zod");
const incidenteSchema = z.object({
 tituloIncidente: z.string().trim().min(5).max(120),
 tipo: z.string().trim().min(2).max(100),
 sistemaAfectado: z.string().trim().max(100).optional(),
 descripcion: z.string().trim().min(10).max(2000),
 prioridad: z.enum(["BAJA", "MEDIA", "ALTA", "CRITICA"]).default("MEDIA"),
 estado: z.enum(["ABIERTO", "EN_PROCESO", "CERRADO"]).default("ABIERTO"),
 evidencia: z.string().trim().max(255).optional()
});
module.exports = { incidenteSchema };