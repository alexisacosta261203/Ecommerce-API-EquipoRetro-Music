// ===============================
// Pantalla de carrito (carrito.html)
// ===============================

const API_URL = "http://localhost:4000/api";
const IVA = 0.16;

// Elements
const cartEmpty = document.getElementById("cartEmpty");
const cartContent = document.getElementById("cartContent");
const cartBody = document.getElementById("cartBody");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartIvaEl = document.getElementById("cartIva");
const cartTotalEl = document.getElementById("cartTotal");
const cartMensaje = document.getElementById("cartMensaje");
const btnConfirmar = document.getElementById("btnConfirmarCompra");

// Render principal del carrito en la tabla
async function cargarCarrito() {
  const carrito = obtenerCarrito(); // función viene de cart.js

  if (!carrito || carrito.length === 0) {
    if (cartEmpty) cartEmpty.style.display = "block";
    if (cartContent) cartContent.style.display = "none";
    if (cartMensaje) cartMensaje.textContent = "Tu carrito está vacío.";
    if (cartSubtotalEl) cartSubtotalEl.textContent = "$0.00";
    if (cartIvaEl) cartIvaEl.textContent = "$0.00";
    if (cartTotalEl) cartTotalEl.textContent = "$0.00";
    return;
  }

  try {
    // 1) Obtener todos los productos del backend
    const res = await fetch(`${API_URL}/productos`);
    if (!res.ok) {
      throw new Error("No se pudieron cargar los productos");
    }
    const data = await res.json();
    const productos = data.productos || data || [];

    // 2) Mapear productos por id
    const mapaProductos = new Map();
    productos.forEach((p) => {
      mapaProductos.set(p.id, p);
    });

    // 3) Construir tabla y totales
    let subtotal = 0;
    if (cartBody) cartBody.innerHTML = "";

    carrito.forEach((item) => {
      const prod = mapaProductos.get(item.productoId);
      if (!prod) return;

      const precio = Number(prod.precio);
      const sub = precio * item.cantidad;
      subtotal += sub;

      if (!cartBody) return;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.nombre}</td>
        <td>$${precio.toFixed(2)}</td>
        <td>
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" data-accion="menos" data-id="${prod.id}">-</button>
            <span>${item.cantidad}</span>
            <button class="cart-qty-btn" data-accion="mas" data-id="${prod.id}">+</button>
          </div>
        </td>
        <td>$${sub.toFixed(2)}</td>
        <td>
          <button class="cart-remove-btn" data-accion="eliminar" data-id="${prod.id}">
            Quitar
          </button>
        </td>
      `;
      cartBody.appendChild(tr);
    });

    const iva = subtotal * IVA;
    const total = subtotal + iva;

    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (cartIvaEl) cartIvaEl.textContent = `$${iva.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;

    if (cartEmpty) cartEmpty.style.display = "none";
    if (cartContent) cartContent.style.display = "block";
    if (cartMensaje) cartMensaje.textContent = "";
  } catch (err) {
    console.error(err);
    if (cartMensaje) {
      cartMensaje.textContent = "Error al cargar el carrito. Intenta más tarde.";
    }
  }
}

// Manejar click en +, -, eliminar
function manejarCambioCantidad(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const accion = btn.getAttribute("data-accion");
  const id = parseInt(btn.getAttribute("data-id"));
  if (!accion || Number.isNaN(id)) return;

  let carrito = obtenerCarrito();
  const idx = carrito.findIndex((i) => i.productoId === id);
  if (idx === -1) return;

  if (accion === "mas") {
    carrito[idx].cantidad += 1;
  } else if (accion === "menos") {
    carrito[idx].cantidad -= 1;
    if (carrito[idx].cantidad <= 0) {
      carrito.splice(idx, 1);
    }
  } else if (accion === "eliminar") {
    carrito = carrito.filter((i) => i.productoId !== id);
  }

  guardarCarrito(carrito);
  actualizarContadorCarrito();
  cargarCarrito();
}

// Confirmar compra -> POST /api/ordenes
async function confirmarCompra() {
  const carrito = obtenerCarrito();

  if (!carrito || carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Debes iniciar sesión para finalizar la compra.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/ordenes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items: carrito })
    });

    // Si el token ya no es válido
    if (res.status === 401 || res.status === 403) {
      alert("Tu sesión ha expirado. Vuelve a iniciar sesión.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("usuarioActual");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg =
        errData.error || errData.message || "Error al crear la orden";
      throw new Error(msg);
    }

    // Si se creó la orden correctamente, vaciamos el carrito
    guardarCarrito([]);
    actualizarContadorCarrito();
    await cargarCarrito();

    alert("Compra confirmada. Te mostraremos el resumen de tus órdenes.");
    window.location.href = "mis-ordenes.html";
  } catch (err) {
    console.error("Error en confirmarCompra:", err);
    alert("No se pudo completar la compra: " + err.message);
  }
}
// Verificar si el usuario está logueado; si no, redirigir a login

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  if (cartBody) {
    cartBody.addEventListener("click", manejarCambioCantidad);
  }

  cargarCarrito();

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", (e) => {
      e.preventDefault();
      confirmarCompra();
    });
  }
});
