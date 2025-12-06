const AUTH_API_URL = "http://localhost:4000/api/auth";

function setMensaje(id, msg, tipo = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("ok", "error");
  el.classList.add(tipo === "ok" ? "ok" : "error");
}

document.addEventListener("DOMContentLoaded", () => {
  const formForgot = document.getElementById("formForgot");
  const formReset = document.getElementById("formReset");

  // Paso 1: solicitar código
  if (formForgot) {
    formForgot.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("forgotEmail").value.trim();
      const btn = document.getElementById("btnForgot");

      if (!email) {
        setMensaje("forgotMensaje", "Ingresa tu correo.", "error");
        return;
      }

      btn.disabled = true;
      setMensaje("forgotMensaje", "Procesando solicitud...", "ok");

      try {
        const res = await fetch(`${AUTH_API_URL}/forgot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMensaje(
            "forgotMensaje",
            data.error || "No se pudo procesar la solicitud.",
            "error"
          );
          return;
        }

        const msg =
          data.message ||
          "Si el correo existe, se ha generado un código de recuperación.";
        setMensaje("forgotMensaje", msg, "ok");
        formForgot.reset();
      } catch (err) {
        console.error(err);
        setMensaje(
          "forgotMensaje",
          "Error de conexión con el servidor.",
          "error"
        );
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Paso 2: enviar código + nueva contraseña
  if (formReset) {
    formReset.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("resetEmail").value.trim();
      const codigo = document.getElementById("resetCode").value.trim();
      const nuevaPassword = document
        .getElementById("resetPassword")
        .value.trim();

      const btn = document.getElementById("btnReset");

      if (!email || !codigo || !nuevaPassword) {
        setMensaje(
          "resetMensaje",
          "Correo, código y nueva contraseña son obligatorios.",
          "error"
        );
        return;
      }

      btn.disabled = true;
      setMensaje("resetMensaje", "Actualizando contraseña...", "ok");

      try {
        const res = await fetch(`${AUTH_API_URL}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, codigo, nuevaPassword }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMensaje(
            "resetMensaje",
            data.error ||
              "No se pudo restablecer la contraseña. Verifica el código.",
            "error"
          );
          return;
        }

        const msg =
          data.message || "Contraseña actualizada correctamente. Ya puedes iniciar sesión.";
        setMensaje("resetMensaje", msg, "ok");
        formReset.reset();

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (err) {
        console.error(err);
        setMensaje(
          "resetMensaje",
          "Error de conexión con el servidor.",
          "error"
        );
      } finally {
        btn.disabled = false;
      }
    });
  }
});