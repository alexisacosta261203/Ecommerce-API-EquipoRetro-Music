// ===============================
// Formulario de contacto
// ===============================

const API_BASE_URL = "http://localhost:4000/api";
const CONTACT_API_URL = `${API_BASE_URL}/contacto`;

const formContacto = document.getElementById("formContacto");
const inputNombre = document.getElementById("nombre");
const inputCorreo = document.getElementById("correo");
const inputMensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");

// Validador simple de correo
function esCorreoValido(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Utilidades visuales (no rompen nada aunque no tengas CSS para ellas)
function marcarError(input) {
  if (!input) return;
  input.classList.remove("input-success");
  input.classList.add("input-error");
}

function marcarOK(input) {
  if (!input) return;
  input.classList.remove("input-error");
  input.classList.add("input-success");
}

function setResultado(msg, tipo = "error") {
  if (!resultado) return;
  resultado.textContent = msg;
  resultado.className = tipo === "ok" ? "form-message success" : "form-message error";
}

async function manejarEnvioContacto(e) {
  e.preventDefault();
  if (!formContacto) return;

  const nombre = (inputNombre?.value || "").trim();
  const correo = (inputCorreo?.value || "").trim();
  const mensaje = (inputMensaje?.value || "").trim();

  let hayError = false;

  // Validar nombre
  if (!nombre) {
    marcarError(inputNombre);
    hayError = true;
  } else if (nombre.length < 3) {
    marcarError(inputNombre);
    hayError = true;
  } else {
    marcarOK(inputNombre);
  }

  // Validar correo
  if (!correo) {
    marcarError(inputCorreo);
    hayError = true;
  } else if (!esCorreoValido(correo)) {
    marcarError(inputCorreo);
    hayError = true;
  } else {
    marcarOK(inputCorreo);
  }

  // Validar mensaje
  if (!mensaje) {
    marcarError(inputMensaje);
    hayError = true;
  } else if (mensaje.length < 10) {
    marcarError(inputMensaje);
    hayError = true;
  } else {
    marcarOK(inputMensaje);
  }

  if (hayError) {
    setResultado("Por favor revisa los campos marcados.", "error");
    return;
  }

  // Deshabilitar botón mientras se envía
  const submitBtn = formContacto.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
  }
  setResultado("Enviando tu mensaje...", "ok");

  try {
    const res = await fetch(CONTACT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        email: correo,
        mensaje,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data.error ||
        data.message ||
        "Ocurrió un error al enviar tu mensaje. Intenta más tarde.";
      setResultado(msg, "error");
      return;
    }

    setResultado("¡Gracias! Hemos recibido tu mensaje correctamente.", "ok");
    formContacto.reset();
    marcarOK(inputNombre);
    marcarOK(inputCorreo);
    marcarOK(inputMensaje);
  } catch (err) {
    console.error("Error en contacto:", err);
    setResultado(
      "Error de conexión. Por favor intenta de nuevo más tarde.",
      "error"
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar mensaje";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (formContacto) {
    formContacto.addEventListener("submit", manejarEnvioContacto);
  }
});
