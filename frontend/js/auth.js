// ===============================
// Autenticación (login / registro)
// ===============================

const AUTH_API_URL = "http://localhost:4000/api/auth";

// Formularios y mensajes
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

// CAPTCHA
const captchaText = document.getElementById("captchaText");
const captchaInput = document.getElementById("captchaInput");
let captchaResultado = null;

// ===============================
// Utilidades de UI
// ===============================
function mostrarMensajeLogin(msg, tipo = "error") {
  if (!loginMessage) return;
  loginMessage.textContent = msg;
  loginMessage.className =
    "auth-message " + (tipo === "ok" ? "ok" : "error");
}

function mostrarMensajeRegistro(msg, tipo = "error") {
  if (!registerMessage) return;
  registerMessage.textContent = msg;
  registerMessage.className =
    "auth-message " + (tipo === "ok" ? "ok" : "error");
}

function esCorreoValido(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===============================
// CAPTCHA simple
// ===============================
function generarCaptcha() {
  if (!captchaText) return;

  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  captchaResultado = a + b;

  captchaText.textContent = `${a} + ${b} = ?`;

  if (captchaInput) {
    captchaInput.value = "";
  }
}

function validarCaptcha() {
  if (!captchaInput || captchaResultado == null) {
    // Si por alguna razón no hay captcha en el DOM, no bloqueamos login.
    return true;
  }

  const valor = parseInt(captchaInput.value, 10);
  if (Number.isNaN(valor) || valor !== captchaResultado) {
    mostrarMensajeLogin("Verifica la operación del captcha.");
    generarCaptcha();
    return false;
  }

  return true;
}

// ===============================
// LOGIN
// ===============================
async function manejarLogin(event) {
  event.preventDefault();
  if (!loginForm) return;

  const email = loginForm.email?.value.trim();
  const password = loginForm.password?.value.trim();

  if (!email || !password) {
    mostrarMensajeLogin("Por favor ingresa tu correo y contraseña.");
    return;
  }

  if (!esCorreoValido(email)) {
    mostrarMensajeLogin("Por favor ingresa un correo electrónico válido.");
    return;
  }

  if (password.length < 6) {
    mostrarMensajeLogin("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (!validarCaptcha()) {
    return;
  }

  try {
    mostrarMensajeLogin("Iniciando sesión...", "ok");

    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        data.error ||
        data.message ||
        "No se pudo iniciar sesión. Verifica tus datos.";
      mostrarMensajeLogin(msg, "error");
      generarCaptcha();
      return;
    }

    if (!data.token || !data.usuario) {
      mostrarMensajeLogin("Respuesta del servidor inválida.", "error");
      generarCaptcha();
      return;
    }

    // Guardar sesión
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));

    mostrarMensajeLogin("Inicio de sesión correcto. Redirigiendo...", "ok");

    setTimeout(() => {
      if (data.usuario.rol === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    }, 1000);
  } catch (err) {
    console.error("Error en login:", err);
    mostrarMensajeLogin("Error de conexión. Intenta más tarde.", "error");
  }
}

// ===============================
// REGISTRO
// ===============================
async function manejarRegistro(event) {
  event.preventDefault();
  if (!registerForm) return;

  const nombre = registerForm.nombre?.value.trim();
  const email = registerForm.email?.value.trim();
  const password = registerForm.password?.value.trim();
  const confirmarPassword = registerForm.confirmarPassword?.value.trim();

  if (!nombre || !email || !password || !confirmarPassword) {
    mostrarMensajeRegistro("Todos los campos son obligatorios.");
    return;
  }

  if (nombre.length < 3) {
    mostrarMensajeRegistro(
      "El nombre debe tener al menos 3 caracteres."
    );
    return;
  }

  if (!esCorreoValido(email)) {
    mostrarMensajeRegistro(
      "Por favor ingresa un correo electrónico válido."
    );
    return;
  }

  if (password.length < 6) {
    mostrarMensajeRegistro(
      "La contraseña debe tener al menos 6 caracteres."
    );
    return;
  }

  if (password !== confirmarPassword) {
    mostrarMensajeRegistro("Las contraseñas no coinciden.");
    return;
  }

  try {
    mostrarMensajeRegistro("Creando cuenta...", "ok");

    const res = await fetch(`${AUTH_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        data.error ||
        data.message ||
        "No se pudo registrar el usuario. Intenta de nuevo.";
      mostrarMensajeRegistro(msg, "error");
      return;
    }

    mostrarMensajeRegistro(
      "Registro exitoso. Ahora puedes iniciar sesión.",
      "ok"
    );

    registerForm.reset();
  } catch (err) {
    console.error("Error en registro:", err);
    mostrarMensajeRegistro(
      "Error de conexión. Intenta más tarde.",
      "error"
    );
  }
}

// ===============================
// INICIALIZACIÓN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (loginForm) {
    loginForm.addEventListener("submit", manejarLogin);
    generarCaptcha();
  }
  if (registerForm) {
    registerForm.addEventListener("submit", manejarRegistro);
  }
});