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
      btn.disabled = true;
      setMensaje("forgotMensaje", "Procesando solicitud...", "ok");

      try {
        const res = await fetch(`${AUTH_API_URL}/forgot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        // En este proyecto, aunque el correo no exista no queremos revelar nada
        if (!res.ok) {
          setMensaje(
            "forgotMensaje",
            data.error || "No se pudo procesar la solicitud.",
            "error"
          );
        } else {
          let msg =
            data.message ||
            "Si el correo está registrado, se ha enviado un código de recuperación.";

          // Para fines académicos, mostramos el código devuelto por el back (simulación de correo)
          if (data.codigo) {
            msg += `\n(Código de demostración: ${data.codigo})`;
          }

          setMensaje("forgotMensaje", msg, "ok");

          // Rellenamos el email también en el form de reset para que no lo vuelva a escribir
          const resetEmail = document.getElementById("resetEmail");
          if (resetEmail && !resetEmail.value) {
            resetEmail.value = email;
          }
        }
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
      btn.disabled = true;
      setMensaje("resetMensaje", "Actualizando contraseña...", "ok");

      try {
        const res = await fetch(`${AUTH_API_URL}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, codigo, nuevaPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMensaje(
            "resetMensaje",
            data.error ||
              "No se pudo restablecer la contraseña. Verifica el código.",
            "error"
          );
        } else {
          setMensaje(
            "resetMensaje",
            "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
            "ok"
          );

          // Opcional: redirigir al login después de unos segundos
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        }
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
