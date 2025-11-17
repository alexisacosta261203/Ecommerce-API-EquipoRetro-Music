const express = require('express');
const cors = require('cors');

// Rutas
const contactoRoutes = require('./routes/contactoRoutes');
const suscripcionRoutes = require('./routes/suscripcionRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/img', express.static('img'));

// Rutas del API
app.use('/api/contacto', contactoRoutes);
app.use('/api/suscripcion', suscripcionRoutes);

app.listen(4000, () => {
    console.log("Servidor backend corriendo en puerto 4000");
});
