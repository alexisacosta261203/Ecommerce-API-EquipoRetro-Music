const pool = require("../db/conexion");

// GET /api/productos
const obtenerProductos = async (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        nombre      AS name,
        marca       AS brand,
        categoria   AS category,
        precio      AS price,
        stock,
        descripcion AS description,
        imagen_url  AS image,
        es_nuevo    AS esNuevo
      FROM productos
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
};


// POST /api/productos
const crearProducto = async (req, res) => {
  try {
    const { name, brand, category, price, stock, description, image } = req.body;

    if (!name || !brand || !category || price == null || stock == null) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    const sqlInsert = `
      INSERT INTO productos (nombre, marca, categoria, precio, stock, descripcion, imagen_url, es_nuevo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const paramsInsert = [
      name,
      brand,
      category,
      price,
      stock,
      description || "",
      image || "",
    ];

    const [result] = await pool.query(sqlInsert, paramsInsert);
    const nuevoId = result.insertId;

    const sqlSelect = `
      SELECT
        id,
        nombre      AS name,
        marca       AS brand,
        categoria   AS category,
        precio      AS price,
        stock,
        descripcion AS description,
        imagen_url  AS image,
        es_nuevo    AS esNuevo
      FROM productos
      WHERE id = ?
    `;
    const [rows] = await pool.query(sqlSelect, [nuevoId]);

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: rows[0],
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ mensaje: "Error al crear producto" });
  }
};


// PUT /api/productos/:id
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, price, stock, description, image } = req.body;

    if (!name || !brand || !category || price == null || stock == null) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    const sqlUpdate = `
      UPDATE productos
      SET nombre = ?, marca = ?, categoria = ?, precio = ?, stock = ?, descripcion = ?, imagen_url = ?
      WHERE id = ?
    `;
    const paramsUpdate = [
      name,
      brand,
      category,
      price,
      stock,
      description || "",
      image || "",
      id,
    ];

    const [result] = await pool.query(sqlUpdate, paramsUpdate);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const sqlSelect = `
      SELECT
        id,
        nombre      AS name,
        marca       AS brand,
        categoria   AS category,
        precio      AS price,
        stock,
        descripcion AS description,
        imagen_url  AS image,
        es_nuevo    AS esNuevo
      FROM productos
      WHERE id = ?
    `;
    const [rows] = await pool.query(sqlSelect, [id]);

    res.json({
      mensaje: "Producto actualizado correctamente",
      producto: rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ mensaje: "Error al actualizar producto" });
  }
};


// DELETE /api/productos/:id
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM productos WHERE id = ?";
    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ mensaje: "Error al eliminar producto" });
  }
};

module.exports = {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
};
