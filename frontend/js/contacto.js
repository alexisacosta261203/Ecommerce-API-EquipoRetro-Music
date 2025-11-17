document.getElementById("formContacto").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const mensaje = document.getElementById("mensaje").value;

    try {
        const res = await fetch("http://localhost:4000/api/contacto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, correo, mensaje })
        });

        const data = await res.json();
        const resultado = document.getElementById("resultado"); 

        if (res.ok) {
            resultado.innerText = "¡Mensaje enviado correctamente!";
            resultado.className = "mensaje-exito"; 
            e.target.reset();
        } else {
            resultado.innerText = data.error || "Hubo un error.";
            resultado.className = "mensaje-error";
        }

    } catch (error) {
        const resultado = document.getElementById("resultado");
        resultado.innerText = "Error de conexión con el servidor.";
        resultado.className = "mensaje-error"; 
    }
});
