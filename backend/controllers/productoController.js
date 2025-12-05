const pool = require("../db/conexion");

// GET /api/admin/productos
const obtenerProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id           AS id,
        p.nombre       AS name,
        p.descripcion  AS description,
        p.precio       AS price,
        p.existencias  AS stock,
        p.imagen       AS image,
        c.nombre       AS category,
        m.nombre       AS brand
      FROM productos p
      JOIN categoriass c ON p.categoria_id = c.id
      JOIN marcas m     ON p.marca_id     = m.id
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
};

// POST /api/admin/productos
// POST /api/admin/productos
const crearProducto = async (req, res) => {
  try {
    let { name, brand, category, price, stock, description, image } = req.body;

    if (!name || !brand || !category || price == null || stock == null) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // 1) Si la imagen viene como URL completa, nos quedamos solo con el path (/uploads/...)
    if (image && (image.startsWith("http://") || image.startsWith("https://"))) {
      try {
        const url = new URL(image);
        image = url.pathname; // ej: /uploads/productos/tangleTW.jpg
      } catch (e) {
        // si falla el parseo, la dejamos tal cual
      }
    }

    // 2) Resolver marca_id
    let marcaId = Number(brand);
    if (Number.isNaN(marcaId)) {
      const [marcaRows] = await pool.query(
        "SELECT id FROM marcas WHERE nombre = ?",
        [brand]
      );
      if (marcaRows.length === 0) {
        return res
          .status(400)
          .json({ mensaje: `La marca '${brand}' no existe en la base de datos` });
      }
      marcaId = marcaRows[0].id;
    }

    // 3) Resolver categoria_id (tabla categoriass)
    let categoriaId = Number(category);
    if (Number.isNaN(categoriaId)) {
      const [catRows] = await pool.query(
        "SELECT id FROM categoriass WHERE nombre = ?",
        [category]
      );
      if (catRows.length === 0) {
        return res
          .status(400)
          .json({ mensaje: `La categoría '${category}' no existe en la base de datos` });
      }
      categoriaId = catRows[0].id;
    }

    // 4) Insertar en productos
    const sqlInsert = `
      INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id, existencias, marca_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const paramsInsert = [
      name,
      description || "",
      price,
      image || "",
      categoriaId,
      stock,
      marcaId,
    ];

    const [result] = await pool.query(sqlInsert, paramsInsert);
    const nuevoId = result.insertId;

    // 5) Volver a leer el producto ya con joins bonitos
    const sqlSelect = `
      SELECT
        p.id           AS id,
        p.nombre       AS name,
        p.descripcion  AS description,
        p.precio       AS price,
        p.existencias  AS stock,
        p.imagen       AS image,
        c.nombre       AS category,
        m.nombre       AS brand
      FROM productos p
      JOIN categoriass c ON p.categoria_id = c.id
      JOIN marcas m      ON p.marca_id     = m.id
      WHERE p.id = ?
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


// PUT /api/admin/productos/:id
// PUT /api/admin/productos/:id
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, brand, category, price, stock, description, image } = req.body;

    if (!name || !brand || !category || price == null || stock == null) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // 1) Normalizar imagen: si viene como URL completa, nos quedamos solo con el path
    if (image && (image.startsWith("http://") || image.startsWith("https://"))) {
      try {
        const url = new URL(image);
        image = url.pathname; // ej: /uploads/productos/tangleTW.jpg
      } catch (e) {
        // si falla, la dejamos como está
      }
    }

    // 2) Resolver marca_id (acepta ID o nombre)
    let marcaId = Number(brand);
    if (Number.isNaN(marcaId)) {
      const [marcaRows] = await pool.query(
        "SELECT id FROM marcas WHERE nombre = ?",
        [brand]
      );
      if (marcaRows.length === 0) {
        return res
          .status(400)
          .json({ mensaje: `La marca '${brand}' no existe en la base de datos` });
      }
      marcaId = marcaRows[0].id;
    }

    // 3) Resolver categoria_id (tabla categoriass) – acepta ID o nombre
    let categoriaId = Number(category);
    if (Number.isNaN(categoriaId)) {
      const [catRows] = await pool.query(
        "SELECT id FROM categoriass WHERE nombre = ?",
        [category]
      );
      if (catRows.length === 0) {
        return res
          .status(400)
          .json({ mensaje: `La categoría '${category}' no existe en la base de datos` });
      }
      categoriaId = catRows[0].id;
    }

    // 4) Actualizar producto
    const sqlUpdate = `
      UPDATE productos
      SET
        nombre       = ?,
        descripcion  = ?,
        precio       = ?,
        imagen       = ?,
        categoria_id = ?,
        existencias  = ?,
        marca_id     = ?
      WHERE id = ?
    `;

    const paramsUpdate = [
      name,
      description || "",
      price,
      image || "",
      categoriaId,
      stock,
      marcaId,
      id,
    ];

    const [result] = await pool.query(sqlUpdate, paramsUpdate);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    // 5) Devolver el producto actualizado con joins
    const sqlSelect = `
      SELECT
        p.id           AS id,
        p.nombre       AS name,
        p.descripcion  AS description,
        p.precio       AS price,
        p.existencias  AS stock,
        p.imagen       AS image,
        c.nombre       AS category,
        m.nombre       AS brand
      FROM productos p
      JOIN categoriass c ON p.categoria_id = c.id
      JOIN marcas m      ON p.marca_id     = m.id
      WHERE p.id = ?
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


// DELETE /api/admin/productos/:id
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
