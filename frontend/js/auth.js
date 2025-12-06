// ===============================
// Autenticación (login / registro) + Captcha
// ===============================

const AUTH_API_URL = "http://localhost:4000/api/auth";

// ---- Referencias al DOM (coinciden con login.html) ----

// Formularios
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");

// Mensajes
const loginMensaje = document.getElementById("loginMensaje");
const registroMensaje = document.getElementById("registroMensaje");

// Campos de registro
const regNombre = document.getElementById("regNombre");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");

// Campos de login
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// Captcha
const captchaBox = document.getElementById("captchaBox");
const captchaText = document.getElementById("captchaText");
const captchaInput = document.getElementById("captchaInput");
let resultadoCaptcha = null;

// ===============================
// Utilidades de UI
// ===============================

function mostrarMensaje(elemento, msg, tipo = "error") {
  if (!elemento) return;
  elemento.textContent = msg || "";
  // Mantén la clase base para que respete el estilo definido en auth.css
  elemento.className = "auth-message";
  if (tipo === "ok") {
    elemento.classList.add("auth-message--ok");
  } else if (tipo === "error") {
    elemento.classList.add("auth-message--error");
  }
}

function esCorreoValido(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===============================
// Captcha
// ===============================

function generarCaptcha() {
  if (!captchaBox || !captchaText || !captchaInput) return;

  const a = Math.floor(Math.random() * 10) + 1; // 1–10
  const b = Math.floor(Math.random() * 10) + 1; // 1–10

  resultadoCaptcha = a + b;
  captchaText.textContent = `${a} + ${b} =`;
  captchaInput.value = "";
}

// ===============================
// LOGIN
// ===============================

async function manejarLogin(event) {
  event.preventDefault();
  if (!formLogin) return;

  const email = loginEmail?.value.trim();
  const password = loginPassword?.value.trim();

  // Validaciones front
  if (!email || !password) {
    mostrarMensaje(loginMensaje, "Por favor ingresa tu correo y contraseña.");
    return;
  }

  if (!esCorreoValido(email)) {
    mostrarMensaje(loginMensaje, "Por favor ingresa un correo electrónico válido.");
    return;
  }

  if (password.length < 6) {
    mostrarMensaje(loginMensaje, "La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  // Validar captcha
  if (captchaInput && resultadoCaptcha !== null) {
    const valorCaptcha = parseInt(captchaInput.value, 10);
    if (Number.isNaN(valorCaptcha) || valorCaptcha !== resultadoCaptcha) {
      mostrarMensaje(
        loginMensaje,
        "Verificación incorrecta. Resuelve la suma correctamente.",
        "error"
      );
      generarCaptcha();
      return;
    }
  }

  try {
    mostrarMensaje(loginMensaje, "Iniciando sesión...", "ok");

    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.error || data.message || "Error al iniciar sesión.";
      mostrarMensaje(loginMensaje, msg, "error");
      generarCaptcha();
      return;
    }

    if (!data.token || !data.usuario) {
      mostrarMensaje(loginMensaje, "Respuesta del servidor inválida.", "error");
      generarCaptcha();
      return;
    }

    // Guardar sesión
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));

    mostrarMensaje(loginMensaje, "Inicio de sesión correcto. Redirigiendo...", "ok");

    // Redirigir según rol
    setTimeout(() => {
      if (data.usuario.rol === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    }, 1000);
  } catch (err) {
    console.error("Error en login:", err);
    mostrarMensaje(loginMensaje, "Error de conexión. Intenta más tarde.", "error");
    generarCaptcha();
  }
}

// ===============================
// REGISTRO
// ===============================

async function manejarRegistro(event) {
  event.preventDefault();
  if (!formRegistro) return;

  const nombre = regNombre?.value.trim();
  const email = regEmail?.value.trim();
  const password = regPassword?.value.trim();

  if (!nombre || !email || !password) {
    mostrarMensaje(registroMensaje, "Todos los campos son obligatorios.");
    return;
  }

  if (nombre.length < 3) {
    mostrarMensaje(registroMensaje, "El nombre debe tener al menos 3 caracteres.");
    return;
  }

  if (!esCorreoValido(email)) {
    mostrarMensaje(registroMensaje, "Por favor ingresa un correo electrónico válido.");
    return;
  }

  if (password.length < 6) {
    mostrarMensaje(registroMensaje, "La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  try {
    mostrarMensaje(registroMensaje, "Creando cuenta...", "ok");

    const res = await fetch(`${AUTH_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.error || data.message || "Error al registrar usuario.";
      mostrarMensaje(registroMensaje, msg, "error");
      return;
    }

    mostrarMensaje(
      registroMensaje,
      "Registro exitoso. Ahora puedes iniciar sesión.",
      "ok"
    );

    formRegistro.reset();
  } catch (err) {
    console.error("Error en registro:", err);
    mostrarMensaje(registroMensaje, "Error de conexión. Intenta más tarde.", "error");
  }
}

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  if (formLogin) {
    formLogin.addEventListener("submit", manejarLogin);
    generarCaptcha(); // generar la suma cuando carga la página de login
  }

  if (formRegistro) {
    formRegistro.addEventListener("submit", manejarRegistro);
  }
});
