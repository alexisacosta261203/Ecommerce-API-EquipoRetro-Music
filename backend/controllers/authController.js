const pool = require("../db/conexion");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Helper para generar JWT
function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET || "secreto_super_seguro",
    { expiresIn: "2h" } // tiempo de vida del token
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
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insertar usuario (intentos_fallidos y bloqueado_hasta usan sus defaults)
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, password_hash, "cliente"]
    );

    const nuevoUsuario = {
      id: result.insertId,
      nombre,
      email,
      rol: "cliente",
    };

    // Generar token
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
    // Buscar usuario
    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash, rol, intentos_fallidos, bloqueado_hasta FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    // Si no existe, respuesta genérica
    if (rows.length === 0) {
      return res.status(400).json({ error: "Credenciales incorrectas" });
    }

    const usuario = rows[0];

    // 1) Revisar si está bloqueado
    if (usuario.bloqueado_hasta) {
      const ahora = new Date();
      const bloqueadoHasta = new Date(usuario.bloqueado_hasta);

      if (bloqueadoHasta > ahora) {
        const minutosRestantes = Math.ceil(
          (bloqueadoHasta.getTime() - ahora.getTime()) / 60000
        );
        return res.status(403).json({
          error:
            "Tu cuenta está bloqueada por intentos fallidos. Intenta de nuevo más tarde.",
          minutosRestantes,
        });
      } else {
        // Bloqueo vencido → limpiar
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
          [usuario.id]
        );
        usuario.intentos_fallidos = 0;
        usuario.bloqueado_hasta = null;
      }
    }

    // 2) Verificar contraseña
    const esValida = await bcrypt.compare(password, usuario.password_hash);

    if (!esValida) {
      // Sumar intento fallido
      const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;

      if (nuevosIntentos >= 3) {
        // Bloquear 5 minutos
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
        // Solo actualizar contador
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = ? WHERE id = ?",
          [nuevosIntentos, usuario.id]
        );

        return res.status(400).json({
          error: "Credenciales incorrectas",
          intentosRestantes: 3 - nuevosIntentos,
        });
      }
    }

    // 3) Contraseña correcta → resetear intentos y desbloqueo
    await pool.query(
      "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
      [usuario.id]
    );

    // Preparar usuario de respuesta
    const usuarioRespuesta = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = generarToken(usuarioRespuesta);

    res.json({
      message: "Login correcto",
      usuario: usuarioRespuesta,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// ======================= PERFIL =======================
// GET /api/auth/me (o /perfil)  (requiere middleware auth)
const perfil = async (req, res) => {
  res.json({
    usuario: req.usuario,
  });
};

// ======================= FORGOT PASSWORD =======================
// POST /api/auth/forgot
const forgotPassword = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { email } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    // Para no revelar si el correo existe o no, siempre respondemos 200
    if (rows.length === 0) {
      return res.json({
        message:
          "Si el correo está registrado, se ha enviado un código de recuperación.",
      });
    }

    const usuario = rows[0];

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código y expiración (10 minutos) en BD
    await pool.query(
      "UPDATE usuarios SET reset_code = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?",
      [codigo, usuario.id]
    );

    // Aquí normalmente enviarías un correo con el código.
    // Para este proyecto, devolvemos el código en la respuesta (simulación de correo).
    res.json({
      message:
        "Se ha generado un código de recuperación. Revisa tu correo (simulado).",
      codigo, // SOLO para demostración académica
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// ======================= RESET PASSWORD =======================
// POST /api/auth/reset
const resetPassword = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { email, codigo, nuevaPassword } = req.body;

  try {
    // Buscar usuario con ese correo, código y que no haya expirado
    const [rows] = await pool.query(
      `SELECT id, nombre, email, rol
       FROM usuarios
       WHERE email = ?
         AND reset_code = ?
         AND reset_expires > NOW()
       LIMIT 1`,
      [email, codigo]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error:
          "Código inválido o expirado. Solicita nuevamente la recuperación.",
      });
    }

    const usuario = rows[0];

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(nuevaPassword, salt);

    // Actualizar contraseña y limpiar código de reset + desbloquear
    await pool.query(
      `UPDATE usuarios
       SET password_hash = ?, reset_code = NULL, reset_expires = NULL,
           intentos_fallidos = 0, bloqueado_hasta = NULL
       WHERE id = ?`,
      [password_hash, usuario.id]
    );

    // Opcional: generar token para loguearlo automáticamente
    const token = generarToken(usuario);

    res.json({
      message: "Contraseña actualizada correctamente.",
      usuario,
      token,
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = {
  register,
  login,
  perfil,
  forgotPassword,
  resetPassword,
};
