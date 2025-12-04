const pool = require('../db/conexion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper para generar JWT
function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    },
    process.env.JWT_SECRET || 'secreto_super_seguro',
    { expiresIn: '2h' } // tiempo de vida del token
  );
}

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
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insertar usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password_hash, 'cliente']
    );

    const nuevoUsuario = {
      id: result.insertId,
      nombre,
      email,
      rol: 'cliente'
    };

    // Generar token
    const token = generarToken(nuevoUsuario);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: nuevoUsuario,
      token
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // Comparar contraseña
    const esValida = await bcrypt.compare(password, usuario.password_hash);
    if (!esValida) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const token = generarToken(usuario);

    // No regresamos password_hash
    delete usuario.password_hash;

    res.json({
      message: 'Login correcto',
      usuario,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// GET /api/auth/me  (requiere middleware auth)
const perfil = async (req, res) => {
  res.json({
    usuario: req.usuario
  });
};

module.exports = {
  register,
  login,
  perfil
};
