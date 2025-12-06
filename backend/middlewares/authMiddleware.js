// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const pool = require("../db/conexion");

// ====================================
// LLAVE JWT UNIFICADA EN TODO EL BACK
// ====================================
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

// Middleware de autenticación general
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
      // IMPORTANTE: usar la MISMA llave que al generar el token
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Error al verificar token:", err.message);
      return res
        .status(401)
        .json({ message: "Token inválido o expirado" });
    }

    // decoded debe contener: id, nombre, email, rol
    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ message: "Token inválido (sin id de usuario)" });
    }

    // Puedes cargar usuario de BD si quieres asegurar que sigue existiendo
    try {
      const [rows] = await pool.query(
        "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
        [decoded.id]
      );

      if (rows.length === 0) {
        return res
          .status(401)
          .json({ message: "Usuario no encontrado o eliminado" });
      }

      // Adjuntar usuario a la request para uso en controladores
      req.user = rows[0];
      req.usuario = rows[0]; // por compatibilidad si en algún código usas req.usuario
    } catch (dbError) {
      console.error("Error consultando usuario en authMiddleware:", dbError);
      return res
        .status(500)
        .json({ message: "Error al validar usuario en BD" });
    }

    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    return res
      .status(500)
      .json({ message: "Error interno en el middleware de autenticación" });
  }
};

// Middleware para rutas solo admin (si lo usas)
const soloAdmin = (req, res, next) => {
  try {
    const user = req.user || req.usuario;
    if (!user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (user.rol !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permisos de administrador" });
    }

    next();
  } catch (error) {
    console.error("Error en soloAdmin:", error);
    return res
      .status(500)
      .json({ message: "Error interno en el middleware soloAdmin" });
  }
};

module.exports = {
  authMiddleware,
  soloAdmin,
};
