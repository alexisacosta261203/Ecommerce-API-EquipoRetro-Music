// backend/config/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // Usaremos Gmail como servicio SMTP (más simple que host/port manuales)
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar conexión al arrancar
transporter
  .verify()
  .then(() => {
    console.log("✅ Mailer listo: conexión SMTP correcta");
  })
  .catch((err) => {
    console.error("❌ Error verificando transporter SMTP:", err);
  });

module.exports = transporter;
