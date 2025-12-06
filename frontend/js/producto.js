// ===============================
// Detalle de producto (producto.html)
// ===============================

const API_URL = "http://localhost:4000/api";

const productoMensaje = document.getElementById("productoMensaje");
const productoCargando = document.getElementById("productoCargando");
const productoContent = document.getElementById("productoContent");

const productoImagen = document.getElementById("productoImagen");
const productoNombre = document.getElementById("productoNombre");
const productoMarca = document.getElementById("productoMarca");
const productoDescripcion = document.getElementById("productoDescripcion");
const productoPrecio = document.getElementById("productoPrecio");
const btnAgregarCarritoDetalle = document.getElementById("btnAgregarCarritoDetalle");

// Obtener parámetro ?id= de la URL
function obtenerIdProductoDeURL() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  if (Number.isNaN(id)) return null;
  return id;
}

// Cargar la info del producto desde la API
async function cargarDetalleProducto() {
  const id = obtenerIdProductoDeURL();
  if (!id) {
    if (productoMensaje) {
      productoMensaje.textContent = "Producto no especificado.";
    }
    if (productoCargando) productoCargando.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const data = await res.json();

    if (!res.ok) {
      const msg = data.error || data.message || "No se pudo cargar el producto.";
      if (productoMensaje) productoMensaje.textContent = msg;
      if (productoCargando) productoCargando.style.display = "none";
      return;
    }

    // Dependiendo de tu API, puede venir como { producto: {...} } o directamente {...}
    const prod = data.producto || data;
    if (!prod) {
      if (productoMensaje) {
        productoMensaje.textContent = "Producto no encontrado.";
      }
      if (productoCargando) productoCargando.style.display = "none";
      return;
    }

    // Llenar datos en DOM
    if (productoImagen) {
      productoImagen.src = prod.imagen_url || "img/no-image.png";
      productoImagen.alt = prod.nombre || "Producto Retro Music";
    }

    if (productoNombre) productoNombre.textContent = prod.nombre || "Producto";
    if (productoMarca) productoMarca.textContent = prod.marca ? `Marca: ${prod.marca}` : "";
    if (productoDescripcion) productoDescripcion.textContent = prod.descripcion || "Sin descripción disponible.";
    if (productoPrecio) {
      const precioNum = Number(prod.precio || 0);
      productoPrecio.textContent = `$${precioNum.toFixed(2)}`;
    }

    // Guardar el id en el botón para usar agregarAlCarrito
    if (btnAgregarCarritoDetalle) {
      btnAgregarCarritoDetalle.setAttribute("data-producto-id", prod.id);
      btnAgregarCarritoDetalle.onclick = () => {
        agregarAlCarrito(prod.id); // función viene de cart.js
      };
    }

    if (productoCargando) productoCargando.style.display = "none";
    if (productoContent) productoContent.style.display = "flex";
    if (productoMensaje) productoMensaje.textContent = "";
  } catch (err) {
    console.error("Error al cargar detalle de producto:", err);
    if (productoMensaje) {
      productoMensaje.textContent = "Error al cargar el producto. Intenta más tarde.";
    }
    if (productoCargando) productoCargando.style.display = "none";
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  cargarDetalleProducto();
});
