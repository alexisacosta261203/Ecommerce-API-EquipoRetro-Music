const conexion = require("../db/conexion");

// GET /api/productos
const obtenerProductos = (req, res) => {
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

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ mensaje: "Error al obtener productos" });
        }
        res.json(resultados);
    });
};

// POST /api/productos
const crearProducto = (req, res) => {
    const { name, brand, category, price, stock, description, image } = req.body;

    if (!name || !brand || !category || price == null || stock == null) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    const sql = `
        INSERT INTO productos (nombre, marca, categoria, precio, stock, descripcion, imagen_url, es_nuevo)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    conexion.query(
        sql,
        [name, brand, category, price, stock, description || null, image || null],
        (error, resultado) => {
            if (error) {
                console.error("Error al crear producto:", error);
                return res.status(500).json({ mensaje: "Error al crear producto" });
            }

            const nuevoId = resultado.insertId;
            const selectSql = `
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
            conexion.query(selectSql, [nuevoId], (err2, filas) => {
                if (err2) {
                    console.error("Error al consultar producto recién creado:", err2);
                    return res.status(500).json({ mensaje: "Producto creado pero no se pudo consultar" });
                }
                res.status(201).json(filas[0]);
            });
        }
    );
};

// PUT /api/productos/:id
const actualizarProducto = (req, res) => {
    const { id } = req.params;
    const { name, brand, category, price, stock, description, image } = req.body;

    const sql = `
        UPDATE productos
        SET nombre = ?, marca = ?, categoria = ?, precio = ?, stock = ?, descripcion = ?, imagen_url = ?
        WHERE id = ?
    `;

    conexion.query(
        sql,
        [name, brand, category, price, stock, description || null, image || null, id],
        (error) => {
            if (error) {
                console.error("Error al actualizar producto:", error);
                return res.status(500).json({ mensaje: "Error al actualizar producto" });
            }

            const selectSql = `
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
            conexion.query(selectSql, [id], (err2, filas) => {
                if (err2) {
                    console.error("Error al consultar producto actualizado:", err2);
                    return res.status(500).json({ mensaje: "Producto actualizado pero no se pudo consultar" });
                }
                res.json(filas[0]);
            });
        }
    );
};

// DELETE /api/productos/:id
const eliminarProducto = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM productos WHERE id = ?";

    conexion.query(sql, [id], (error) => {
        if (error) {
            console.error("Error al eliminar producto:", error);
            return res.status(500).json({ mensaje: "Error al eliminar producto" });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    });
};

module.exports = {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
};
