
require("dotenv").config();
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const allRoutes = require('./routes/categoriasRoutes');
const pool = require('./db/conexion');
const path = require('path');
const contactoRoutes = require('./routes/contactoRoutes');
const suscripcionRoutes = require('./routes/suscripcionRoutes');
const authRoutes = require('./routes/authRoutes');
const ordenRoutes = require('./routes/ordenRoutes');




const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./db/conexion");

// Rutas
const categoriasRoutes = require("./routes/categoriasRoutes");
const contactoRoutes = require("./routes/contactoRoutes");
const suscripcionRoutes = require("./routes/suscripcionRoutes");
const productosRoutes = require("./routes/productosRoutes"); // 👈 nueva ruta

const app = express();
const PORT = process.env.PORT || 3000;

// ----- MIDDLEWARES -----
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

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


// main
app.use("/api/contacto", contactoRoutes);
app.use("/api/suscripcion", suscripcionRoutes);

// categorías (antes las llamabas allRoutes en /api)
app.use("/api", categoriasRoutes);

app.use('/api/auth', authRoutes);

// Todas las rutas en un solo archivo
app.use('/api', allRoutes);
app.use('/api', ordenRoutes); //para api ordenes


// productos (para el panel de admin)
app.use("/api/productos", productosRoutes);

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
        console.log("Error conexión:", e.message);
    }
}

// ----- ARRANQUE SERVIDOR -----
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    await testConnection();
});


 

