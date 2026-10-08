require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function migrarPasswords() {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, password: true }
  });
  const pendientes = usuarios.filter(({ password }) => !/^\$2[aby]\$/.test(password));

  if (process.env.CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION !== "true") {
    console.log(`${pendientes.length} contraseña(s) requieren hash bcrypt. No se modificó la base.`);
    console.log("Para ejecutar la migración: CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION=true npm run migrate:passwords");
    return;
  }

  for (const usuario of pendientes) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: await bcrypt.hash(usuario.password, 12) }
    });
  }

  console.log(`${pendientes.length} contraseña(s) migradas a bcrypt.`);
}

migrarPasswords()
  .catch((error) => {
    console.error("No se pudieron migrar las contraseñas heredadas:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
