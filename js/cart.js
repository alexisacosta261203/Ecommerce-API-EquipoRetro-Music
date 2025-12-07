// ===============================
// Carrito de Retro Music (Front)
// ===============================

// Clave base para el carrito en localStorage
const CART_KEY_BASE = "retroMusicCart";

// Obtener la clave específica según el usuario (para que cada usuario tenga su carrito)
function obtenerCartKey() {
  try {
    // Si tienes una función global que regresa el usuario actual, la usamos
    if (typeof obtenerUsuarioActual === "function") {
      const user = obtenerUsuarioActual();
      if (user && user.id) {
        return `${CART_KEY_BASE}_user_${user.id}`;
      }
    }
  } catch (e) {
    console.warn("Error obteniendo usuario actual:", e);
  }

  // Si no hay usuario o falla, usamos una clave general
  return CART_KEY_BASE;
}

// Leer carrito desde localStorage
function obtenerCarrito() {
  const key = obtenerCartKey();
  const raw = localStorage.getItem(key);

  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch (e) {
    console.error("Error parseando carrito:", e);
    return [];
  }
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
  const key = obtenerCartKey();
  localStorage.setItem(key, JSON.stringify(carrito));
}

// Obtener número total de unidades en el carrito
function obtenerTotalCarrito() {
  const carrito = obtenerCarrito();
  return carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

// Actualizar contador visual del carrito (ícono en el header)
function actualizarContadorCarrito() {
  const span = document.getElementById("contadorCarrito");
  if (!span) return;

  const total = obtenerTotalCarrito();
  span.textContent = total > 0 ? total : "0";
}

// Verificar si el usuario está logueado (muy simple, puedes ajustarlo)
function estaLogueado() {
  const token = localStorage.getItem("authToken");
  return !!token;
}

// Agregar un producto al carrito
function agregarAlCarrito(productId) {
  // 1) Validar login
  if (!estaLogueado()) {
    alert("Debes iniciar sesión para agregar al carrito.");
    window.location.href = "login.html";
    return;
  }

  const idNum = parseInt(productId);
  if (Number.isNaN(idNum)) {
    console.warn("ID de producto inválido para carrito:", productId);
    return;
  }

  // 2) Leer carrito actual
  const carrito = obtenerCarrito();

  // 3) Buscar si ya existe
  const existente = carrito.find((item) => item.productoId === idNum);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      productoId: idNum,
      cantidad: 1
    });
  }

  // 4) Guardar cambios
  guardarCarrito(carrito);
  actualizarContadorCarrito();

  // 5) Feedback al usuario
  alert("Producto agregado al carrito.");
}

// Conectar los botones "Agregar al carrito" de las tarjetas
function conectarBotonesCarrito() {
  const botones = document.querySelectorAll(".add-to-cart-button");
  if (!botones || botones.length === 0) return;

  botones.forEach((btn) => {
    const id = btn.getAttribute("data-producto-id");
    btn.onclick = () => agregarAlCarrito(id);
  });
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorCarrito();
  // Si la página ya tiene tarjetas renderizadas, conectamos los botones
  conectarBotonesCarrito();
});
