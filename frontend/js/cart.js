// ===============================
// Carrito de Retro Music (Front)
// ===============================

// Clave base para el carrito en localStorage
const CART_KEY_BASE = "retroMusicCart";

// Obtener la clave específica según el usuario (para que cada usuario tenga su carrito)
function obtenerCartKey() {
  try {
    if (typeof obtenerUsuarioActual === "function") {
      const user = obtenerUsuarioActual();
      if (user && user.id) {
        return `${CART_KEY_BASE}_user_${user.id}`;
      }
    }
  } catch (e) {
    console.warn("No se pudo obtener usuario actual para carrito:", e);
  }
  return CART_KEY_BASE;
}

// Leer carrito desde localStorage
function obtenerCarrito() {
  const key = obtenerCartKey();
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
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

// Actualizar contador visual del carrito en la página de productos (si existe)
function actualizarContadorCarrito() {
  const span = document.getElementById("contadorCarrito");
  if (!span) return;
  const total = obtenerTotalCarrito();
  span.textContent = `(${total})`;
}

// Agregar un producto al carrito (requiere sesión)
function agregarAlCarrito(productId) {
  // 1) Verificar que haya sesión
  if (typeof estaLogueado === "function" && !estaLogueado()) {
    alert("Para usar el carrito necesitas iniciar sesión.");
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
      cantidad: 1,
    });
  }

  // 4) Guardar cambios
  guardarCarrito(carrito);
  actualizarContadorCarrito();

  // Feedback sencillo
  console.log(`Producto ${idNum} agregado al carrito.`);
}

// Conectar los botones "Agregar al carrito" de las tarjetas renderizadas
function conectarBotonesCarrito() {
  const botones = document.querySelectorAll(".add-to-cart-button");
  if (!botones || botones.length === 0) return;

  botones.forEach((btn) => {
    const id = btn.getAttribute("data-producto-id");
    btn.onclick = () => agregarAlCarrito(id);
  });
}

// Ejecutar al cargar la página para que el contador se vea correcto
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorCarrito();
});
