require("dotenv").config();

const { obtenerSecretoJwt } = require("./config/jwt");
obtenerSecretoJwt();
if (process.env.NODE_ENV === "production") {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl || new URL(frontendUrl).protocol !== "https:") {
    throw new Error("FRONTEND_URL debe ser el origen HTTPS de la aplicación en producción");
  }
}
const app = require("./app");
const prisma = require("./config/prisma");
const servidor = app.listen(process.env.PORT || 3000, () => {
 console.log("API disponible en http://localhost:3000");
});
async function cerrar() {
 servidor.close();
 await prisma.$disconnect();
 process.exit(0);
}
process.on("SIGINT", cerrar);
process.on("SIGTERM", cerrar);