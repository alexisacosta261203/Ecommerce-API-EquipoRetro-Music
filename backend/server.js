// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// Conexión a BD (pool con promesas)
const pool = require("./db/conexion");

// Rutas
const categoriasRoutes = require("./routes/categoriasRoutes");
const contactoRoutes = require("./routes/contactoRoutes");
const suscripcionRoutes = require("./routes/suscripcionRoutes");
const authRoutes = require("./routes/authRoutes");
const ordenRoutes = require("./routes/ordenRoutes");
const productosRoutes = require("./routes/productosRoutes"); // CRUD admin productos

// Middlewares de autenticación
const { authMiddleware, soloAdmin } = require("./middlewares/authMiddleware");

const app = express();
const PORT = process.env.PORT || 4000;

// ----- MIDDLEWARES -----
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Logs de cada petición
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/img", express.static("img")); // carpeta estática de main

// ----- RUTAS -----

// main (contacto y suscripción)
app.use("/api/contacto", contactoRoutes);
app.use("/api/suscripcion", suscripcionRoutes);

// auth
app.use("/api/auth", authRoutes);

// tienda (categorías, órdenes, etc. “públicos”)
app.use("/api", categoriasRoutes);
app.use("/api", ordenRoutes);

// admin: CRUD de productos (protegido con JWT y rol admin)
app.use(
  "/api/admin/productos",
  authMiddleware, // verifica token
  soloAdmin,      // verifica rol 'admin'
  productosRoutes // rutas CRUD
);

// Ruta de prueba
app.get("/test", (req, res) => {
  console.log("Ruta /test accedida");
  res.json({ message: "Backend funcionando!", time: new Date() });
});

// ----- TEST CONEXIÓN BD -----
async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("Conexión OK:", rows[0].result);
  } catch (e) {
    console.log("Error conexión:", e);
  }
}

// ----- ARRANQUE SERVIDOR -----
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await testConnection();
});
