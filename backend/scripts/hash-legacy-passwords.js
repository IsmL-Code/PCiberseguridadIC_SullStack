require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../src/database/prisma");

async function migrarPasswords() {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, password: true }
  });
  const pendientes = usuarios.filter(({ password }) => !/^\$2[aby]\$/.test(password));

  if (process.env.CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION !== "true") {
    // eslint-disable-next-line no-console -- Report migration status to the operator.
    console.log(`${pendientes.length} contraseña(s) requieren hash bcrypt. No se modificó la base.`);
    // eslint-disable-next-line no-console -- Provide the operator with the confirmation command.
    console.log("Para ejecutar la migración: CONFIRM_LEGACY_PASSWORD_HASH_MIGRATION=true npm run migrate:passwords");
    return;
  }

  for (const usuario of pendientes) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: await bcrypt.hash(usuario.password, 12) }
    });
  }

  // eslint-disable-next-line no-console -- Report migration results to the operator.
  console.log(`${pendientes.length} contraseña(s) migradas a bcrypt.`);
}

migrarPasswords()
  .catch((error) => {
    // eslint-disable-next-line no-console -- Surface migration failures in the CLI.
    console.error("No se pudieron migrar las contraseñas heredadas:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
