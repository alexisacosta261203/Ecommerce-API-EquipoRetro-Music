document.getElementById("formSuscripcion").addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correoSus").value;
    const resultadoSus = document.getElementById("resultadoSus"); 

    try {
        const res = await fetch("http://localhost:4000/api/suscripcion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo })
        });

        const data = await res.json();

        if (res.ok) {
            resultadoSus.innerText = data.mensaje;
            resultadoSus.className = "mensaje-exito"; 
            e.target.reset();
        } else {
            resultadoSus.innerText = data.error;
            resultadoSus.className = "mensaje-error"; 
        }

    } catch (error) {
        resultadoSus.innerText = "Error de conexión con el servidor.";
        resultadoSus.className = "mensaje-error"; 
    }
});
