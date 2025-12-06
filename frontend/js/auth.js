// ===============================
// Autenticación (login / registro)
// ===============================

const AUTH_API_URL = "http://localhost:4000/api/auth";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

// Utilidades de UI
function mostrarMensajeLogin(msg, tipo = "error") {
  if (!loginMessage) return;
  loginMessage.textContent = msg;
  loginMessage.className = tipo === "ok" ? "form-message success" : "form-message error";
}

function mostrarMensajeRegistro(msg, tipo = "error") {
  if (!registerMessage) return;
  registerMessage.textContent = msg;
  registerMessage.className = tipo === "ok" ? "form-message success" : "form-message error";
}

// Validaciones básicas
function esCorreoValido(email) {
  // Regex sencilla, suficiente para front
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===============================
// LOGIN
// ===============================

async function manejarLogin(event) {
  event.preventDefault();
  if (!loginForm) return;

  const email = loginForm.email?.value.trim();
  const password = loginForm.password?.value.trim();

  // Validaciones front
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

  try {
    mostrarMensajeLogin("Iniciando sesión...", "ok");

    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.error || data.message || "Error al iniciar sesión.";
      mostrarMensajeLogin(msg);
      return;
    }

    // Esperamos { token, usuario }
    if (!data.token || !data.usuario) {
      mostrarMensajeLogin("Respuesta del servidor inválida.");
      return;
    }

    // Guardar sesión
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));

    mostrarMensajeLogin("Inicio de sesión correcto. Redirigiendo...", "ok");

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
    mostrarMensajeLogin("Error de conexión. Intenta más tarde.");
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

  // Validaciones front
  if (!nombre || !email || !password || !confirmarPassword) {
    mostrarMensajeRegistro("Todos los campos son obligatorios.");
    return;
  }

  if (nombre.length < 3) {
    mostrarMensajeRegistro("El nombre debe tener al menos 3 caracteres.");
    return;
  }

  if (!esCorreoValido(email)) {
    mostrarMensajeRegistro("Por favor ingresa un correo electrónico válido.");
    return;
  }

  if (password.length < 6) {
    mostrarMensajeRegistro("La contraseña debe tener al menos 6 caracteres.");
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
      const msg = data.error || data.message || "Error al registrar usuario.";
      mostrarMensajeRegistro(msg);
      return;
    }

    mostrarMensajeRegistro("Registro exitoso. Ahora puedes iniciar sesión.", "ok");

    // Opcional: limpiar formulario
    registerForm.reset();
  } catch (err) {
    console.error("Error en registro:", err);
    mostrarMensajeRegistro("Error de conexión. Intenta más tarde.");
  }
}

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  if (loginForm) {
    loginForm.addEventListener("submit", manejarLogin);
  }
  if (registerForm) {
    registerForm.addEventListener("submit", manejarRegistro);
  }
});
