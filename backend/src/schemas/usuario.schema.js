const { z } = require("zod");

const usuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  apellido: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(100).transform((email) => email.toLowerCase()),
  password: z.string().min(8),
  rol: z.string().trim().min(1).max(50),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DELETED"]).optional()
});

const actualizarUsuarioSchema = usuarioSchema.extend({
  password: z.string().min(8).optional()
});

const estadoUsuarioSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DELETED"])
});

module.exports = { usuarioSchema, actualizarUsuarioSchema, estadoUsuarioSchema };