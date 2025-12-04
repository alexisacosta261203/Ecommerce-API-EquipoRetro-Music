const express = require('express');
const router = express.Router();

const { crearOrden, listarMisOrdenes } = require('../controllers/ordenController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Crear una nueva orden a partir del carrito
router.post('/ordenes', authMiddleware, crearOrden);

// Obtener historial de órdenes del usuario logueado
router.get('/ordenes/mias', authMiddleware, listarMisOrdenes);

module.exports = router;
