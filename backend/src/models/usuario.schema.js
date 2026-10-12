const { z } = require("zod");
const { RoleEnum } = require("../models/roles.model");

const rolSchema = z.string()
  .trim()
  .transform((rol) => rol.toLowerCase())
  .pipe(z.enum(Object.values(RoleEnum).map((rol) => rol.toLowerCase())))
  .transform((rol) => RoleEnum[rol.toUpperCase()]);

const usuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  apellido: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(100).transform((email) => email.toLowerCase()),
  password: z.string().min(8),
  rol: rolSchema,
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DELETED"]).optional()
});

const actualizarUsuarioSchema = usuarioSchema.extend({
  password: z.string().min(8).optional()
});

const estadoUsuarioSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DELETED"])
});

module.exports = { usuarioSchema, actualizarUsuarioSchema, estadoUsuarioSchema };