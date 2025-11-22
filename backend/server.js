require('dotenv').config();
const express = require('express');
const cors = require('cors');
const categoriasRutas = require('./routes/categoriasRoutes.js');
const pool = require('./db/conexion'); //aqui estamos importando la conexion
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
res.send(' Estoy funcionando');
});

app.use('/api/categorias', categoriasRoutes);

async function testConnection() {
try {
const [rows] = await pool.query('SELECT 1 + 1 AS result');  

console.log(' Conexión a la base de datos establecida. Resultado:', rows[0].result);
} catch (error) {
console.error(' Error al conectar con la base de datos:', error.message);
}
}
// Iniciar servidor y probar conexión
app.listen(PORT, async () => {
console.log(`Servidor escuchando en http://localhost:${PORT}`);
await testConnection(); 
});