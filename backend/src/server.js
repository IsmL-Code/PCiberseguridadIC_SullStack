require("dotenv").config();
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