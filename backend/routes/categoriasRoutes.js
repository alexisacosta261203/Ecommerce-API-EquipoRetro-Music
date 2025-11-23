const express = require('express');
const router = express.Router();

// CORREGIR LA IMPORTACIÓN - debe coincidir con el nombre del archivo
const {
    getCategorias,
    getCategoriaProductos,
    getMarcas,
    getMarcaProductos,
    getProductos
} = require('../controllers/categoriaController'); // ← ESTÁ BIEN ASÍ (categoriaController)

// -------------------------------
// CATEGORÍAS
// -------------------------------
router.get('/categorias', getCategorias);
router.get('/categorias/:id/productos', getCategoriaProductos);

// -------------------------------
// MARCAS
// -------------------------------
router.get('/marcas', getMarcas);
router.get('/marcas/:id/productos', getMarcaProductos);

// -------------------------------
// PRODUCTOS
// -------------------------------
router.get('/productos', getProductos);

module.exports = router;