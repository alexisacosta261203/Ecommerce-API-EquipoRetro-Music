// URL base del backend de autenticación
const AUTH_API_URL = "http://localhost:4000/api/auth";

// Helper para mostrar mensajes
function setMensaje(elementId, mensaje, tipo = "error") {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = mensaje;
  el.classList.remove("error", "ok");
  el.classList.add(tipo === "ok" ? "ok" : "error");
}

// Guardar sesión en localStorage
function guardarSesion(token, usuario) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("usuarioActual", JSON.stringify(usuario));
}

// Opcional: para después, leer usuario logueado
function obtenerUsuarioActual() {
  const raw = localStorage.getItem("usuarioActual");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("formRegistro");
  const formLogin = document.getElementById("formLogin");

  if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = document.getElementById("btnRegistro");
      btn.disabled = true;
      setMensaje("registroMensaje", "Procesando...", "ok");

      const nombre = document.getElementById("regNombre").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;

      try {
        const res = await fetch(`${AUTH_API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          const msg =
            data.error ||
            (data.errores && data.errores[0]?.msg) ||
            "Error al registrar.";
          setMensaje("registroMensaje", msg, "error");
        } else {
          setMensaje("registroMensaje", "Registro correcto. Iniciando sesión...", "ok");
          guardarSesion(data.token, data.usuario);

          // Pequeño delay y redirigir
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        }
      } catch (error) {
        console.error("Error en registro:", error);
        setMensaje("registroMensaje", "Error de conexión con el servidor.", "error");
      } finally {
        btn.disabled = false;
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = document.getElementById("btnLogin");
      btn.disabled = true;
      setMensaje("loginMensaje", "Validando datos...", "ok");

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      try {
        const res = await fetch(`${AUTH_API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          const msg =
            data.error ||
            (data.errores && data.errores[0]?.msg) ||
            "Correo o contraseña incorrectos.";
          setMensaje("loginMensaje", msg, "error");
        } else {
          setMensaje("loginMensaje", "Inicio de sesión correcto.", "ok");
          guardarSesion(data.token, data.usuario);

          setTimeout(() => {
            window.location.href = "index.html";
          }, 800);
        }
      } catch (error) {
        console.error("Error en login:", error);
        setMensaje("loginMensaje", "Error de conexión con el servidor.", "error");
      } finally {
        btn.disabled = false;
      }
    });
  }
});
