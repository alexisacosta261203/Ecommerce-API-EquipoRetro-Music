const pool = require('../db/conexion');

//productos todos
const getProductos = async (req, res) => {
    try {
        console.log("Ejecutando consulta de productos...");
        
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre AS categoria, m.nombre AS marca
            FROM productos p
            JOIN categoriass c ON p.categoria_id = c.id  
            JOIN marcas m ON p.marca_id = m.id
        `);

        console.log(`Encontrados ${rows.length} productos`);
        res.json(rows);
        
    } catch (error) {
        console.error("Error en getProductos:", error.message);
        res.status(500).json({ 
            error: "Error obteniendo productos",
            message: error.message
        });
    }
};

//categorias
const getCategorias = async (req, res) => {
    try {
        console.log("Ejecutando consulta de categorías...");
        const [rows] = await pool.query("SELECT * FROM categoriass"); 
        console.log(`Encontradas ${rows.length} categorías`);
        res.json(rows);
    } catch (error) {
        console.error("Error en getCategorias:", error.message);
        res.status(500).json({ 
            error: "Error obteniendo categorías",
            message: error.message
        });
    }
};

//productos por categoria
const getCategoriaProductos = async (req, res) => {
    const categoriaId = req.params.id;
    
    try {
        console.log(`Buscando productos para categoría ${categoriaId}...`);
        
        const [rows] = await pool.query(
            `SELECT p.*, c.nombre AS categoria, m.nombre AS marca
             FROM productos p
             JOIN categoriass c ON p.categoria_id = c.id  
             JOIN marcas m ON p.marca_id = m.id
             WHERE p.categoria_id = ?`,
            [categoriaId]
        );
        
        console.log(`Encontrados ${rows.length} productos para categoría ${categoriaId}`);
        res.json(rows);
        
    } catch (error) {
        console.error("Error en getCategoriaProductos:", error.message);
        res.status(500).json({ 
            error: "Error obteniendo productos por categoría",
            message: error.message
        });
    }
};

//marcas
const getMarcas = async (req, res) => {
    try {
        console.log("Ejecutando consulta de marcas...");
        const [rows] = await pool.query("SELECT * FROM marcas");
        console.log(`Encontradas ${rows.length} marcas`);
        res.json(rows);
    } catch (error) {
        console.error("Error en getMarcas:", error.message);
        res.status(500).json({ 
            error: "Error obteniendo marcas",
            message: error.message
        });
    }
};

//productos marca
const getMarcaProductos = async (req, res) => {
    const marcaId = req.params.id;
    
    try {
        console.log(`Buscando productos para marca ${marcaId}...`);
        
        const [rows] = await pool.query(
            `SELECT p.*, c.nombre AS categoria, m.nombre AS marca
             FROM productos p
             JOIN categoriass c ON p.categoria_id = c.id  -- ← CORREGIDO: categoriass
             JOIN marcas m ON p.marca_id = m.id
             WHERE p.marca_id = ?`,
            [marcaId]
        );

        console.log(`Encontrados ${rows.length} productos para marca ${marcaId}`);
        res.json(rows);
        
    } catch (error) {
        console.error("Error en getMarcaProductos:", error.message);
        res.status(500).json({ 
            error: "Error obteniendo productos por marca",
            message: error.message
        });
    }
};

module.exports = {
    getCategorias,
    getCategoriaProductos,
    getMarcas,
    getMarcaProductos,
    getProductos
};