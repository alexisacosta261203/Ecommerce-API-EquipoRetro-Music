const express = require('express');
const { body } = require('express-validator');
const { register, login, perfil } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Correo inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  login
);

// GET /api/auth/me  (protegida)
router.get('/me', authMiddleware, perfil);

module.exports = router;
