const transporter = require("../config/mailer");

exports.suscribir = async (req, res) => {
    const { correo } = req.body;

    try {
        await transporter.sendMail({
            from: `"Mi Tienda Online" <${process.env.MAIL_USER}>`,
            to: correo,
            subject: "¡Gracias por suscribirte!",
            html: `
                <div style="font-family:Arial; padding:20px;">
                    <h2>Bienvenido(a)</h2>
                    <p>Gracias por suscribirte a nuestro boletín. Pronto recibirás noticias, descuentos y novedades.</p>
                </div>
            `
            ,
            attachments: [
                {
                    filename: 'cupon.png',
                    path: './img/cupon.png',
                    cid: 'cupon_suscripcion'
                }
            ]
        });

        res.json({ mensaje: "Suscripción exitosa, correo enviado" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al enviar correo de suscripción" });
    }
};
