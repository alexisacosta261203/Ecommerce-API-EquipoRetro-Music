document.getElementById("formSuscripcion").addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correoSus").value;

    try {
        const res = await fetch("http://localhost:4000/api/suscripcion", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ correo })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById("resultadoSus").innerText = data.mensaje;
            document.getElementById("resultadoSus").style.color = "green";
            e.target.reset();
        } else {
            document.getElementById("resultadoSus").innerText = data.error;
            document.getElementById("resultadoSus").style.color = "red";
        }

    } catch (error) {
        document.getElementById("resultadoSus").innerText = "Error de conexión con el servidor.";
        document.getElementById("resultadoSus").style.color = "red";
    }
});
