const transporter = require("../config/mailer");

exports.enviarContacto = async (req, res) => {
    const { nombre, correo, mensaje } = req.body;

    try {
        await transporter.sendMail({
            from: '"Retro Music" <TU_CORREO@gmail.com>',
            to: correo,
            subject: "Gracias por contactarnos",
            html: `
                <div style="font-family:Arial; padding:20px;">
                    <img src="cid:logo_tienda" width="120">
                    <h2>Hola ${nombre},</h2>
                    <p>Gracias por escribirnos, <b>en breve será atendido</b>.</p>
                    <p><i>Donde la música y el artista se vuelven uno solo, los mejores instrumentos que verás en tu vida.</i></p>
                </div>
            `,
            attachments: [
                {
                    filename: 'logo.png',
                    path: './img/logo.png',
                    cid: 'logo_tienda'
                }
            ]
        });

        res.json({ mensaje: "Correo enviado correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al enviar correo", detalle: error.message });
    }
};
