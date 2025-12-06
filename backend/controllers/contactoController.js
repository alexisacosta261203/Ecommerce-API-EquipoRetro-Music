// backend/controllers/contactoController.js
const transporter = require("../config/mailer");

exports.enviarContacto = async (req, res) => {
  try {
    console.log("📨 Datos recibidos en /api/contacto:", req.body);

    const { nombre, mensaje } = req.body;
    const correo =
      req.body.correo ||
      req.body.email ||
      req.body.correoElectronico ||
      req.body.correo_contacto;

    if (!nombre || !mensaje || !correo) {
      return res.status(400).json({
        error: "Faltan datos del formulario",
        detalle: {
          nombre: !!nombre,
          mensaje: !!mensaje,
          correo: !!correo,
        },
      });
    }

    await transporter.sendMail({
      from: `"Retro Music" <${process.env.EMAIL}>`,
      to: correo,
      subject: "Gracias por contactarnos",
      html: `
        <div style="font-family:Arial; padding:20px;">
          <img src="cid:logo_tienda" width="120" style="margin-bottom:10px;">
          <h2>Hola ${nombre},</h2>
          <p>Gracias por escribirnos, <b>en breve será atendido</b>.</p>
          <p style="margin-top:15px;">
            <i>Donde la música y el artista se vuelven uno solo,
            los mejores instrumentos que verás en tu vida.</i>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: "./img/logo.png",
          cid: "logo_tienda",
        },
      ],
    });

    res.json({ mensaje: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar correo de contacto:", error);
    res.status(500).json({
      error: "Error al enviar correo",
      detalle: error.message,
    });
  }
};
