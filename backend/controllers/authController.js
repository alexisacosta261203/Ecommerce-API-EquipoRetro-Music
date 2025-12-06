// backend/controllers/authController.js
const pool = require("../db/conexion");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// ====================================
// LLAVE JWT UNIFICADA EN TODO EL BACK
// ====================================
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

// Helper para generar JWT
function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
    JWT_SECRET, // <- USAMOS SIEMPRE LA MISMA LLAVE
    { expiresIn: "2h" } // tiempo de vida del token
  );
}

// =============================
// POST /api/auth/register
// Registro de usuario normal
// =============================
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array(), message: "Datos inválidos" });
    }

    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ message: "Faltan datos obligatorios para el registro" });
    }

    // Verificar si ya existe el usuario
    const [rows] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Ya existe un usuario registrado con ese correo" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar en base de datos
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, passwordHash, "cliente"]
    );

    const nuevoUsuario = {
      id: result.insertId,
      nombre,
      email,
      rol: "cliente",
    };

    // Generar JWT
    const token = generarToken(nuevoUsuario);

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: nuevoUsuario,
      token,
    });
  } catch (error) {
    console.error("Error en register:", error);
    return res
      .status(500)
      .json({ message: "Error interno en el servidor (register)" });
  }
};

// =============================
// POST /api/auth/login
// Login de usuario
// =============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Faltan email o contraseña" });
    }

    // Buscar usuario
    const [rows] = await pool.query(
      "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Credenciales incorrectas" });
    }

    const usuario = rows[0];

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res
        .status(401)
        .json({ message: "Credenciales incorrectas" });
    }

    const usuarioPayload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    // Generar token
    const token = generarToken(usuarioPayload);

    return res.json({
      message: "Login exitoso",
      usuario: usuarioPayload,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res
      .status(500)
      .json({ message: "Error interno en el servidor (login)" });
  }
};

// =============================
// GET /api/auth/perfil
// (Opcional, si lo usas)
// =============================
exports.perfil = async (req, res) => {
  try {
    // req.user viene del authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    return res.json({
      usuario: req.user,
    });
  } catch (error) {
    console.error("Error en perfil:", error);
    return res
      .status(500)
      .json({ message: "Error interno en el servidor (perfil)" });
  }
};
