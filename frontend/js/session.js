// ===============================
// Manejo simple de sesión en el front
// Lee authToken y usuarioActual del localStorage
// y actualiza el menú de la parte superior.
// ===============================

// Leer usuario actual desde localStorage
function obtenerUsuarioActual() {
  const raw = localStorage.getItem("usuarioActual");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo parsear usuarioActual:", e);
    return null;
  }
}

function estaLogueado() {
  const token = localStorage.getItem("authToken");
  const usuario = obtenerUsuarioActual();
  return !!token && !!usuario;
}

// Cerrar sesión: limpiar storage y recargar a inicio
function cerrarSesion() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("usuarioActual");
  // Si más adelante guardas carrito ligado a usuario, aquí puedes limpiar más cosas
  window.location.href = "index.html";
}

// Pintar el elemento del menú según el estado de sesión
function renderizarMenuAuth() {
  const li = document.getElementById("menu-auth");
  if (!li) return; // Por si esta página no tiene el li

  if (!estaLogueado()) {
    // No hay sesión -> mostrar link a login
    li.innerHTML = `<a href="login.html">Iniciar sesión</a>`;
  } else {
    const usuario = obtenerUsuarioActual();
    const nombre = usuario?.nombre || "Usuario";
    const soloNombre = nombre.split(" ")[0]; // "Kevin", por ejemplo

    li.innerHTML = `
      <span class="menu-usuario">Hola, ${soloNombre}</span>
      <button id="btnLogout" class="btn-logout-menu">Salir</button>
    `;

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        cerrarSesion();
      });
    }
  }
}

// Ejecutar cuando cargue el DOM
document.addEventListener("DOMContentLoaded", renderizarMenuAuth);
