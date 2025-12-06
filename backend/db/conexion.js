/*const mysql = require("mysql2");

const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",          // tu usuario de MySQL
    password: "",          // tu contraseña (en XAMPP suele ser "")
    database: "retro_music_db", // ⚠️ nombre exacto de tu BD
});

conexion.connect((error) => {
    if (error) {
        console.error("Error al conectar a la BD:", error);
        return;
    }
    console.log("Conectado a la base de datos retro_music_db ✅");
});

module.exports = conexion;
*/

// db/conexion.js
const mysql = require('mysql2/promise'); 
const pool = mysql.createPool({ 
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
waitForConnections: true, 
connectionLimit: 10, 
queueLimit: 0 
});
module.exports = pool;   