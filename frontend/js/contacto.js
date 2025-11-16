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

        if (res.ok) {
            document.getElementById("resultado").innerText = "¡Mensaje enviado correctamente!";
            document.getElementById("resultado").style.color = "green";
            e.target.reset();
        } else {
            document.getElementById("resultado").innerText = data.error || "Hubo un error.";
            document.getElementById("resultado").style.color = "red";
        }

    } catch (error) {
        document.getElementById("resultado").innerText = "Error de conexión con el servidor.";
        document.getElementById("resultado").style.color = "red";
    }
});
