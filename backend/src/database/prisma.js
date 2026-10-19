require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const databaseUrlValue = process.env.DATABASE_URL;

if (!databaseUrlValue) {
  throw new Error("DATABASE_URL no está definido. Agrega la variable al archivo backend/.env");
}

const adapter = new PrismaPg({ connectionString: databaseUrlValue });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;