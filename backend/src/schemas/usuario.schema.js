const { z } = require("zod");

const usuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  apellido: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(100).transform((email) => email.toLowerCase()),
  password: z.string().min(8),
  rol: z.string().trim().min(1).max(50)
});

module.exports = { usuarioSchema };