const { z } = require("zod");
const {
 mensajeTextoInvalido,
 mensajeContenidoPeligroso,
 esContenidoSeguro,
 esTextoLegible
} = require("../utils/validacionTexto");

const tiposIncidente = [
 "Phishing",
 "Malware",
 "Ransomware",
 "Fuerza bruta",
 "Acceso no autorizado",
 "Fuga de información",
 "Denegación de servicio",
 "Ingeniería social",
 "Otro"
];

const incidenteSchema = z.object({
 tituloIncidente: z.string().trim().min(5, "El título debe tener al menos 5 caracteres").max(120)
  .refine(esContenidoSeguro, mensajeContenidoPeligroso)
  .refine(esTextoLegible, mensajeTextoInvalido),
 tipo: z.enum(tiposIncidente),
 sistemaAfectado: z.string().trim().max(100)
  .refine((valor) => !valor || esContenidoSeguro(valor), mensajeContenidoPeligroso)
  .refine((valor) => !valor || esTextoLegible(valor), mensajeTextoInvalido).optional(),
 descripcion: z.string().trim().min(10).max(2000)
  .refine(esContenidoSeguro, mensajeContenidoPeligroso)
  .refine(esTextoLegible, mensajeTextoInvalido),
 prioridad: z.enum(["BAJA", "MEDIA", "ALTA", "CRITICA"]).default("MEDIA"),
 estado: z.enum(["ABIERTO", "EN_PROCESO", "CERRADO"]).default("ABIERTO")
});
module.exports = { incidenteSchema };
