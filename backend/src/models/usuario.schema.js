const { z } = require("zod");
const { RoleEnum } = require("../models/roles.model");
const {
  mensajeNombreInvalido,
  mensajePasswordInvalida,
  esNombrePersonaValido,
  esPasswordSegura
} = require("../utils/validacionTexto");

const rolSchema = z.string()
  .trim()
  .transform((rol) => rol.toLowerCase())
  .pipe(z.enum(Object.values(RoleEnum).map((rol) => rol.toLowerCase())))
  .transform((rol) => RoleEnum[rol.toUpperCase()]);

const nombreSchema = z.string().trim().min(1, "Este campo es obligatorio").max(100)
  .refine(esNombrePersonaValido, mensajeNombreInvalido);

const usuarioBaseSchema = z.object({
  nombre: nombreSchema,
  apellido: nombreSchema,
  email: z.string().trim().email().max(100).transform((email) => email.toLowerCase()),
  password: z.string().max(72),
  rol: rolSchema,
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DELETED"]).optional()
});

const validarPassword = (datos, ctx) => {
  if (datos.password !== undefined && !esPasswordSegura(datos.password, datos)) {
    ctx.addIssue({ code: "custom", path: ["password"], message: mensajePasswordInvalida });
  }
};

const usuarioSchema = usuarioBaseSchema.superRefine(validarPassword);

const actualizarUsuarioSchema = usuarioBaseSchema
  .extend({ password: z.string().max(72).optional() })
  .superRefine(validarPassword);

const estadoUsuarioSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DELETED"])
});

module.exports = { usuarioSchema, actualizarUsuarioSchema, estadoUsuarioSchema };