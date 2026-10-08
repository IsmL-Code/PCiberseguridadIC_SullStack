const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

async function iniciarSesion(req, res, next) {
  const { email, password } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const passwordValida = usuario.password.startsWith("$2")
      ? await bcrypt.compare(password, usuario.password)
      : password === usuario.password;

    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || "clave-desarrollo-cambiar-en-produccion",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        status: usuario.status
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { iniciarSesion };