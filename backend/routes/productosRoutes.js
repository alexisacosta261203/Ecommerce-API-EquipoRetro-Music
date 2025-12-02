const express = require("express");
const router = express.Router();

const {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
} = require("../controllers/productoController");

// Si quisieras protegerlas:
// const authMiddleware = require("../middlewares/authMiddleware");
// router.use(authMiddleware);

router.get("/", obtenerProductos);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;
