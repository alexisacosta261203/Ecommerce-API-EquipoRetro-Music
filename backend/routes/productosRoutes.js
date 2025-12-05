const express = require("express");
const router = express.Router();

const {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");

const { authMiddleware, soloAdmin } = require("../middlewares/authMiddleware");

// ✅ TODO lo de admin pasa por aquí
router.use(authMiddleware, soloAdmin);

// GET /api/admin/productos
router.get("/", obtenerProductos);

// POST /api/admin/productos
router.post("/", crearProducto);

// PUT /api/admin/productos/:id
router.put("/:id", actualizarProducto);

// DELETE /api/admin/productos/:id
router.delete("/:id", eliminarProducto);

module.exports = router;
