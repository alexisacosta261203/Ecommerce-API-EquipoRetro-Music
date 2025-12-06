// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const pool = require("../db/conexion");

// Middleware para validar JWT y adjuntar usuario a req.user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Token inválido o expirado" });
    }

    // Opcional pero recomendado: verificar que el usuario exista en BD
    const [rows] = await pool.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Guardamos el usuario en req.user para middlewares/rutas siguientes
    req.user = rows[0];
    req.usuario = rows[0]; 

    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor en autenticación" });
  }
};

// Middleware para permitir solo admins
const soloAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.rol !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso restringido a administradores" });
  }

  next();
};

module.exports = {
  authMiddleware,
  soloAdmin,
};
