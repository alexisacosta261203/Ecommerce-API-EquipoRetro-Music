// URL base del backend
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

// Render principal
async function cargarCarrito() {
  const carrito = obtenerCarrito(); // viene de cart.js

  if (!carrito || carrito.length === 0) {
    cartEmpty.style.display = "block";
    cartContent.style.display = "none";
    cartMensaje.textContent = "";
    return;
  }

  cartEmpty.style.display = "none";
  cartContent.style.display = "block";

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    const mapa = {};
    productos.forEach(p => { mapa[p.id] = p; });

    // Construir filas
    cartBody.innerHTML = "";
    let subtotal = 0;

    carrito.forEach(item => {
      const prod = mapa[item.productoId];
      if (!prod) return;

      const precio = Number(prod.precio);
      const sub = precio * item.cantidad;
      subtotal += sub;

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

    const iva = +(subtotal * IVA).toFixed(2);
    const total = +(subtotal + iva).toFixed(2);

    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartIvaEl.textContent = `$${iva.toFixed(2)}`;
    cartTotalEl.textContent = `$${total.toFixed(2)}`;

    // Eventos de + / - / quitar
    cartBody.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", manejarCambioCantidad);
    });

  } catch (err) {
    console.error("Error cargando carrito:", err);
    cartMensaje.textContent = "Error al cargar productos del carrito.";
    cartMensaje.className = "cart-message error";
  }
}

function manejarCambioCantidad(e) {
  const btn = e.currentTarget;
  const accion = btn.getAttribute("data-accion");
  const id = parseInt(btn.getAttribute("data-id"));
  if (Number.isNaN(id)) return;

  let carrito = obtenerCarrito();
  const item = carrito.find(i => i.productoId === id);
  if (!item) return;

  if (accion === "mas") {
    item.cantidad += 1;
  } else if (accion === "menos") {
    item.cantidad = Math.max(1, item.cantidad - 1);
  } else if (accion === "eliminar") {
    carrito = carrito.filter(i => i.productoId !== id);
  }

  guardarCarrito(carrito);
  actualizarContadorCarrito();
  cargarCarrito();
}

// Confirmar compra -> POST /api/ordenes
async function confirmarCompra() {
  cartMensaje.textContent = "";
  cartMensaje.className = "cart-message";

  if (typeof estaLogueado === "function" && !estaLogueado()) {
    alert("Debes iniciar sesión para confirmar la compra.");
    window.location.href = "login.html";
    return;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Sesión no encontrada. Vuelve a iniciar sesión.");
    window.location.href = "login.html";
    return;
  }

  const carrito = obtenerCarrito();
  if (!carrito || carrito.length === 0) {
    cartMensaje.textContent = "Tu carrito está vacío.";
    cartMensaje.className = "cart-message error";
    return;
  }

  try {
    btnConfirmar.disabled = true;
    cartMensaje.textContent = "Procesando orden...";
    cartMensaje.className = "cart-message";

    const res = await fetch(`${API_URL}/ordenes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        items: carrito.map(i => ({
          productoId: i.productoId,
          cantidad: i.cantidad
        }))
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error al crear orden:", data);
      cartMensaje.textContent = data.error || "No se pudo crear la orden.";
      cartMensaje.className = "cart-message error";
      return;
    }

    // Éxito
    cartMensaje.textContent = `Orden #${data.orden.id} creada correctamente. Total: $${data.orden.total.toFixed(2)}`;
    cartMensaje.className = "cart-message ok";

    // Vaciar carrito
    guardarCarrito([]);
    actualizarContadorCarrito();
    cargarCarrito();

  } catch (err) {
    console.error("Error en confirmarCompra:", err);
    cartMensaje.textContent = "Error de conexión al crear la orden.";
    cartMensaje.className = "cart-message error";
  } finally {
    btnConfirmar.disabled = false;
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  cargarCarrito();

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", (e) => {
      e.preventDefault();
      confirmarCompra();
    });
  }
});
