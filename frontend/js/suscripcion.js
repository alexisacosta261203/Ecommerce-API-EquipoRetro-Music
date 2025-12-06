document.addEventListener("DOMContentLoaded", () => {
  const formSuscripcion = document.getElementById("formSuscripcion");
  const correoInput = document.getElementById("correoSus");
  const resultadoSus = document.getElementById("resultadoSus");

  if (!formSuscripcion || !correoInput || !resultadoSus) {
    // La página actual no tiene el formulario de suscripción
    return;
  }

  // Validador simple de correo
  function esCorreoValido(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function setMensaje(msg, tipo = "error") {
    resultadoSus.innerText = msg;
    resultadoSus.className = tipo === "ok" ? "mensaje-exito" : "mensaje-error";
  }

  formSuscripcion.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = correoInput.value.trim();

    // Validaciones front
    if (!correo) {
      setMensaje("Por favor ingresa tu correo electrónico.", "error");
      correoInput.classList.add("input-error");
      correoInput.classList.remove("input-success");
      return;
    }

    if (!esCorreoValido(correo)) {
      setMensaje("El formato del correo electrónico no es válido.", "error");
      correoInput.classList.add("input-error");
      correoInput.classList.remove("input-success");
      return;
    }

    correoInput.classList.remove("input-error");
    correoInput.classList.add("input-success");
    setMensaje("Enviando suscripción...", "ok");

    const submitBtn = formSuscripcion.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    try {
      const res = await fetch("http://localhost:4000/api/suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMensaje(data.mensaje || "¡Gracias por suscribirte!", "ok");
        formSuscripcion.reset();
        correoInput.classList.remove("input-error");
        correoInput.classList.add("input-success");
      } else {
        setMensaje(
          data.error ||
            data.message ||
            "No se pudo registrar tu suscripción. Intenta más tarde.",
          "error"
        );
        correoInput.classList.add("input-error");
        correoInput.classList.remove("input-success");
      }
    } catch (error) {
      console.error("Error en suscripción:", error);
      setMensaje("Error de conexión con el servidor.", "error");
      correoInput.classList.add("input-error");
      correoInput.classList.remove("input-success");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Suscribirme";
      }
    }
  });
});
