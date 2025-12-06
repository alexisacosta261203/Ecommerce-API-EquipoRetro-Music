// ===============================
// Mis órdenes (historial de compras)
// ===============================

const API_BASE_URL = "http://localhost:4000/api";

// Elementos del DOM
const ordenesEmpty = document.getElementById("ordenesEmpty");
const ordenesContent = document.getElementById("ordenesContent");
const ordenesBody = document.getElementById("ordenesBody");
const ordenesMensaje = document.getElementById("ordenesMensaje");

// Obtener token desde localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Redirigir a login si no hay sesión
function asegurarSesion() {
  const token = getAuthToken();
  const rawUser = localStorage.getItem("usuarioActual");

  if (!token || !rawUser) {
    alert("Debes iniciar sesión para ver tu historial de órdenes.");
    window.location.href = "login.html";
    return false;
  }

  return true;
}

// Formato sencillo de fecha desde timestamp o ISO
function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return fechaStr;
  return fecha.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Cargar órdenes del backend
async function cargarMisOrdenes() {
  if (!asegurarSesion()) return;

  const token = getAuthToken();

  try {
    const res = await fetch(`${API_BASE_URL}/ordenes/mias`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Si el token ya no sirve
    if (res.status === 401 || res.status === 403) {
      alert("Tu sesión ha expirado. Vuelve a iniciar sesión.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("usuarioActual");
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      const msg = data.error || "Error al obtener tus órdenes.";
      if (ordenesMensaje) {
        ordenesMensaje.textContent = msg;
      }
      return;
    }

    const ordenes = data.ordenes || [];

    if (!ordenes.length) {
      if (ordenesEmpty) ordenesEmpty.style.display = "block";
      if (ordenesContent) ordenesContent.style.display = "none";
      if (ordenesMensaje) ordenesMensaje.textContent = "";
      return;
    }

    if (ordenesBody) ordenesBody.innerHTML = "";

    ordenes.forEach((ord) => {
      const tr = document.createElement("tr");

      const fecha = formatearFecha(ord.fecha_creacion || ord.created_at);
      const subtotal = Number(ord.subtotal || 0).toFixed(2);
      const impuesto = Number(ord.impuesto || 0).toFixed(2);
      const total = Number(ord.total || 0).toFixed(2);
      const estado = ord.estado || "pendiente";

      tr.innerHTML = `
        <td>${ord.id}</td>
        <td>${fecha}</td>
        <td>$${subtotal}</td>
        <td>$${impuesto}</td>
        <td>$${total}</td>
        <td>${estado}</td>
      `;

      ordenesBody.appendChild(tr);
    });

    if (ordenesEmpty) ordenesEmpty.style.display = "none";
    if (ordenesContent) ordenesContent.style.display = "block";
    if (ordenesMensaje) ordenesMensaje.textContent = "";
  } catch (err) {
    console.error("Error cargando órdenes:", err);
    if (ordenesMensaje) {
      ordenesMensaje.textContent =
        "Error al cargar tu historial de órdenes. Intenta más tarde.";
    }
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  cargarMisOrdenes();
});
