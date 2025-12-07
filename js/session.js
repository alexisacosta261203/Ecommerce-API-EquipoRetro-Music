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
  if (!li) return;

  const token = localStorage.getItem("authToken");
  const rawUser = localStorage.getItem("usuarioActual");

  // Si no hay sesión, solo mostramos "Iniciar sesión"
  if (!token || !rawUser) {
    li.innerHTML = '<a href="login.html">Iniciar sesión</a>';
    return;
  }

  let usuario;
  try {
    usuario = JSON.parse(rawUser);
  } catch (e) {
    console.error("Error parseando usuarioActual:", e);
    li.innerHTML = '<a href="login.html">Iniciar sesión</a>';
    return;
  }

 const nombre = (usuario.nombre || "Usuario").split(" ")[0];

let adminLink = "";
if (usuario.rol === "admin") {
  adminLink = '<a href="admin.html" class="link-admin">Panel admin</a>';
}

li.innerHTML = `
  <span class="menu-usuario">Hola, ${nombre}</span>
  <a href="mis-ordenes.html" class="link-mis-ordenes">Mis órdenes</a>
  ${adminLink}
  <button id="btnLogout" class="btn-logout-menu">Salir</button>
`;


  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("usuarioActual");
      // recarga para refrescar el menú
      window.location.href = "index.html";
    });
  }
}


// Ejecutar cuando cargue el DOM
document.addEventListener("DOMContentLoaded", renderizarMenuAuth);
