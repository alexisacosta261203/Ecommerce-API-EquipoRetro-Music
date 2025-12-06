const pool = require("../db/conexion");

// Impuesto simple 16%
const IVA = 0.16;

// POST /api/ordenes  (requiere usuario logueado)
const crearOrden = async (req, res) => {
  // viene del authMiddleware
  const user = req.user || req.usuario;
  if (!user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  const { items } = req.body; // [{ productoId, cantidad }, ...]

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  // Normalizar cantidades
  const itemsLimpios = items
    .map((it) => ({
      productoId: parseInt(it.productoId),
      cantidad: Math.max(1, parseInt(it.cantidad) || 1),
    }))
    .filter((it) => !Number.isNaN(it.productoId));

  if (itemsLimpios.length === 0) {
    return res.status(400).json({ error: "Carrito inválido" });
  }

  // Obtener IDs únicos de productos
  const ids = [...new Set(itemsLimpios.map((i) => i.productoId))];
  const placeholders = ids.map(() => "?").join(",");

  try {
    const conn = await pool.getConnection();

    try {
      // Traer productos con precio y existencias
      const [productos] = await conn.query(
        `SELECT id, nombre, precio, existencias 
         FROM productos 
         WHERE id IN (${placeholders})`,
        ids
      );

      if (productos.length === 0) {
        conn.release();
        return res.status(400).json({ error: "Productos no encontrados" });
      }

      // Mapear por id
      const mapaProductos = {};
      for (const p of productos) {
        mapaProductos[p.id] = p;
      }

      let subtotal = 0;
      const detalles = [];

      // 1) Validar stock y calcular totales
      for (const item of itemsLimpios) {
        const prod = mapaProductos[item.productoId];
        if (!prod) continue;

        const stockActual = Number(prod.existencias || 0);
        if (stockActual < item.cantidad) {
          conn.release();
          return res.status(400).json({
            error: `No hay existencias suficientes de "${prod.nombre}". Disponibles: ${stockActual}`,
          });
        }

        const precio = Number(prod.precio);
        const sub = precio * item.cantidad;
        subtotal += sub;

        detalles.push({
          producto_id: prod.id,
          nombre: prod.nombre,
          cantidad: item.cantidad,
          precio_unitario: precio,
          subtotal: sub,
        });
      }

      if (detalles.length === 0) {
        conn.release();
        return res
          .status(400)
          .json({ error: "Ningún producto válido en el carrito" });
      }

      const impuesto = +(subtotal * IVA).toFixed(2);
      const total = +(subtotal + impuesto).toFixed(2);

      await conn.beginTransaction();

      // 2) Insertar orden
      const [ordenResult] = await conn.query(
        `INSERT INTO ordenes (usuario_id, subtotal, impuesto, total, estado)
         VALUES (?, ?, ?, ?, 'pendiente')`,
        [user.id, subtotal, impuesto, total]
      );

      const ordenId = ordenResult.insertId;

      // 3) Insertar detalles
      const detalleValues = detalles.map((d) => [
        ordenId,
        d.producto_id,
        d.cantidad,
        d.precio_unitario,
        d.subtotal,
      ]);

      await conn.query(
        `INSERT INTO orden_detalles 
         (orden_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ?`,
        [detalleValues]
      );

      // 4) Actualizar existencias de productos
      for (const d of detalles) {
        await conn.query(
          `UPDATE productos
           SET existencias = existencias - ?
           WHERE id = ?`,
          [d.cantidad, d.producto_id]
        );
      }

      await conn.commit();
      conn.release();

      res.status(201).json({
        mensaje: "Orden creada correctamente",
        orden: {
          id: ordenId,
          usuario_id: user.id,
          subtotal,
          impuesto,
          total,
          estado: "pendiente",
          detalles,
        },
      });
    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error("Error al crear orden:", err);
      res.status(500).json({ error: "Error al crear la orden" });
    }
  } catch (err) {
    console.error("Error de conexión:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// GET /api/ordenes/mias (historial del usuario actual)
const listarMisOrdenes = async (req, res) => {
  const user = req.usuario || req.user;

  if (!user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    const [ordenes] = await pool.query(
      "SELECT * FROM ordenes WHERE usuario_id = ? ORDER BY fecha DESC",
      [user.id]
    );

    res.json({ ordenes });
  } catch (err) {
    console.error("Error al obtener órdenes:", err);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
};

module.exports = {
  crearOrden,
  listarMisOrdenes,
};
