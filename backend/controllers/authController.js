const pool = require("../db/conexion");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// MISMO secreto que en authMiddleware
const JWT_SECRET = "retro_music_2025_secret";

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}


// ======================= REGISTER =======================
// POST /api/auth/register
const register = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { nombre, email, password } = req.body;

  try {
    // ¿Ya existe el correo?
    const [rows] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).json({
        error: "El correo ya está registrado",
      });
    }

    // Hashear contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario (intentos_fallidos y bloqueado_hasta para el bloqueo)
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol, intentos_fallidos, bloqueado_hasta) VALUES (?, ?, ?, ?, 0, NULL)",
      [nombre, email, password_hash, "cliente"]
    );

    const nuevoUsuario = {
      id: result.insertId,
      nombre,
      email,
      rol: "cliente",
    };

    const token = generarToken(nuevoUsuario);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: nuevoUsuario,
      token,
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// ======================= LOGIN (con bloqueo) =======================
// POST /api/auth/login
const login = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { email, password } = req.body;

  try {
    // Buscar usuario por correo
    const [rows] = await pool.query(
      `SELECT id, nombre, email, password_hash, rol, intentos_fallidos, bloqueado_hasta
       FROM usuarios
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = rows[0];

    // 1) Verificar si está bloqueado
    if (usuario.bloqueado_hasta) {
      const ahora = new Date();
      const bloqueoHasta = new Date(usuario.bloqueado_hasta);

      if (bloqueoHasta > ahora) {
        const msRestantes = bloqueoHasta.getTime() - ahora.getTime();
        const minRestantes = Math.ceil(msRestantes / 60000);

        return res.status(403).json({
          error: `Has excedido el número de intentos. Tu cuenta estará bloqueada aproximadamente ${minRestantes} minuto(s).`,
        });
      } else {
        // El bloqueo ya expiró
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
          [usuario.id]
        );
        usuario.intentos_fallidos = 0;
        usuario.bloqueado_hasta = null;
      }
    }

    // 2) Verificar contraseña
    const esValida =
      usuario.password_hash &&
      (await bcrypt.compare(password, usuario.password_hash));

    if (!esValida) {
      const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;

      if (nuevosIntentos >= 3) {
        const bloqueoHasta = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = ? WHERE id = ?",
          [bloqueoHasta, usuario.id]
        );

        return res.status(403).json({
          error:
            "Has excedido el número de intentos. Tu cuenta estará bloqueada durante 5 minutos.",
        });
      } else {
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = ? WHERE id = ?",
          [nuevosIntentos, usuario.id]
        );

        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
    }

    // 3) Login correcto → limpiar contador / bloqueo
    await pool.query(
      "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
      [usuario.id]
    );

    const datosUsuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = generarToken(datosUsuario);

    res.json({
      message: "Login exitoso",
      usuario: datosUsuario,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// ======================= PERFIL =======================
const perfil = async (req, res) => {
  res.json({
    usuario: req.user || req.usuario || null,
  });
};

module.exports = {
  register,
  login,
  perfil,
};
