const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization'];

  if (!header) {
    return res.status(401).json({ error: 'Falta header Authorization' });
  }

  // Esperamos: "Bearer token"
  const partes = header.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  const token = partes[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secreto_super_seguro'
    );
    req.usuario = decoded; // { id, nombre, email, rol }
    next();
  } catch (error) {
    console.error('Error verificando token:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware extra para solo admins
const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Requiere rol administrador' });
  }
  next();
};

module.exports = {
  authMiddleware,
  soloAdmin
};
