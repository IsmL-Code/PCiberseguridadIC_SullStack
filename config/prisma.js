const { PrismaClient } = require("@prisma/client");
// Esta instancia se comparte en todos los servicios.
const prisma = new PrismaClient();
module.exports = prisma;