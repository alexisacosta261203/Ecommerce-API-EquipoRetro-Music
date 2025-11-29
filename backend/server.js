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




const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MIDDLEWARE DE LOGS
app.use((req, res, next) => {
    console.log(` ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Servir imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/img', express.static('img')); // carpeta estática de main

// Rutas de main
app.use('/api/contacto', contactoRoutes);
app.use('/api/suscripcion', suscripcionRoutes);

app.use('/api/auth', authRoutes);

// Todas las rutas en un solo archivo
app.use('/api', allRoutes);
app.use('/api', ordenRoutes); //para api ordenes

// Ruta de prueba básica
app.get('/test', (req, res) => {
    console.log('Ruta /test accedida');
    res.json({ message: 'Backend funcionando!', time: new Date() });
});

// Test conexión
async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log("Conexión OK:", rows[0].result);
    } catch (e) {
        console.log("Error conexión:", e.message);
    }
}

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    await testConnection();
});
 