const express = require('express');
const router = express.Router();

//importamos
const {
    getCategorias,
    getCategoriaProductos,
    getMarcas,
    getMarcaProductos,
    getProductos
} = require('../controllers/categoriaController'); 

//categorias
router.get('/categorias', getCategorias);
router.get('/categorias/:id/productos', getCategoriaProductos);

//marcas
router.get('/marcas', getMarcas);
router.get('/marcas/:id/productos', getMarcaProductos);

//prodcutos
router.get('/productos', getProductos);

module.exports = router;