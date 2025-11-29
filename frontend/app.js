// ========== CONFIGURACIÓN INICIAL ==========

// Definir la URL base de la API del backend
const API_URL = "http://localhost:4000/api";

// Variables globales para almacenar los datos de la aplicación
let todosLosProductos = [];        // Array que contendrá todos los productos obtenidos de la API
let categorias = [];               // Array que contendrá todas las categorías disponibles
let marcas = [];                   // Array que contendrá todas las marcas disponibles
let filtrosActivos = {             // Objeto que guarda los filtros actualmente aplicados
    categoria: '',                 // ID de la categoría activa (vacío = sin filtro)
    marca: ''                      // ID de la marca activa (vacío = sin filtro)
};
let ordenActual = 'recomendados';  // Variable que guarda el tipo de ordenamiento actual



// Evento que se ejecuta cuando el documento HTML está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar las categorías desde la API
    cargarCategorias();
    // Cargar las marcas desde la API
    cargarMarcas();
    // Cargar todos los productos desde la API
    cargarProductos();
    // Configurar todos los event listeners de la interfaz
    configurarEventListeners();
});



// Función para configurar todos los event listeners de la aplicación
function configurarEventListeners() {
    // Obtener el elemento select de ordenamiento del DOM
    const ordenSelect = document.getElementById('ordenSelect');
    
    // Verificar que el elemento existe antes de agregar el event listener
    if (ordenSelect) {
        // Agregar event listener para cambios en el selector de ordenamiento
        ordenSelect.addEventListener('change', function(e) {
            // Actualizar la variable de ordenamiento con el valor seleccionado
            ordenActual = e.target.value;
            // Aplicar los nuevos filtros y ordenamiento
            aplicarFiltrosYOrdenamiento();
        });
    }

    // Buscar el botón "Todas" en el contenedor de categorías
    const btnTodasCategorias = document.querySelector('#categoriasContainer .filter-button[data-valor=""]');
    
    // Verificar que el botón existe
    if (btnTodasCategorias) {
        // Agregar event listener para el botón "Todas" de categorías
        btnTodasCategorias.addEventListener('click', function() {
            // Llamar función para limpiar el filtro de categorías
            limpiarFiltro('categoria', this);
        });
    }

    // Buscar el botón "Todas" en el contenedor de marcas
    const btnTodasMarcas = document.querySelector('#marcasContainer .filter-button[data-valor=""]');
    
    // Verificar que el botón existe
    if (btnTodasMarcas) {
        // Agregar event listener para el botón "Todas" de marcas
        btnTodasMarcas.addEventListener('click', function() {
            // Llamar función para limpiar el filtro de marcas
            limpiarFiltro('marca', this);
        });
    }

    // Configurar la funcionalidad de subida de imágenes
    configurarSubidaImagenes();
}



// Función para limpiar un filtro específico (categoría o marca)
function limpiarFiltro(tipo, elemento) {
    // Mostrar mensaje en consola para debugging
    console.log(`Limpiando filtro de ${tipo}`);
    
    // Remover la clase 'active' de todos los botones del mismo tipo (categoría o marca)
    document.querySelectorAll(`.filter-button[data-tipo="${tipo}"]`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar la clase 'active' al botón "Todas" que fue clickeado
    elemento.classList.add('active');
    
    // Limpiar el filtro activo estableciendo el valor como string vacío
    filtrosActivos[tipo] = '';
    
    // Aplicar los cambios recalculando filtros y re-renderizando
    aplicarFiltrosYOrdenamiento();
}


// Función asíncrona para cargar las categorías desde la API
async function cargarCategorias() {
    try {
        // Hacer petición GET a la API para obtener categorías
        const response = await fetch(`${API_URL}/categorias`);
        
        // Verificar si la respuesta fue exitosa (status 200-299)
        if (!response.ok) throw new Error('Error al cargar categorías');
        
        // Convertir la respuesta a JSON y guardar en la variable categorias
        categorias = await response.json();
        
        // Renderizar los botones de categorías en la interfaz
        renderizarBotonesCategorias();
        
    } catch (error) {
        // Manejar errores en la carga de categorías
        console.error("Error cargando categorías:", error);
        // Mostrar mensaje de error al usuario
        mostrarError('Error al cargar las categorías');
    }
}

// Función asíncrona para cargar las marcas desde la API
async function cargarMarcas() {
    try {
        // Hacer petición GET a la API para obtener marcas
        const response = await fetch(`${API_URL}/marcas`);
        
        // Verificar si la respuesta fue exitosa
        if (!response.ok) throw new Error('Error al cargar marcas');
        
        // Convertir la respuesta a JSON y guardar en la variable marcas
        marcas = await response.json();
        
        // Renderizar los botones de marcas en la interfaz
        renderizarBotonesMarcas();
        
    } catch (error) {
        // Manejar errores en la carga de marcas
        console.error("Error cargando marcas:", error);
        // Mostrar mensaje de error al usuario
        mostrarError('Error al cargar las marcas');
    }
}

// Función asíncrona para cargar todos los productos desde la API
async function cargarProductos() {
    try {
        // Hacer petición GET a la API para obtener productos
        const response = await fetch(`${API_URL}/productos`);
        
        // Verificar si la respuesta fue exitosa
        if (!response.ok) throw new Error('Error al cargar productos');
        
        // Convertir la respuesta a JSON y guardar en la variable todosLosProductos
        todosLosProductos = await response.json();
        
        // Limpiar y normalizar los datos de productos
        limpiarDatosProductos();
        
        // Verificar el estado de las imágenes de los productos
        verificarImagenesProductos();
        
        // Aplicar filtros y ordenamiento inicial
        aplicarFiltrosYOrdenamiento();
        
        // Cargar productos en el selector para subida de imágenes
        cargarProductosParaSelector();
        
    } catch (error) {
        // Manejar errores en la carga de productos
        console.error("Error cargando productos:", error);
        // Mostrar mensaje de error al usuario
        mostrarError('Error al cargar los productos');
    }
}



// Función para limpiar y normalizar los datos de productos
function limpiarDatosProductos() {
    // Mensaje de depuración
    console.log('Limpiando datos de productos...');
    
    // Recorrer todos los productos y aplicar transformaciones
    todosLosProductos = todosLosProductos.map(producto => {
        // Detectar y limpiar imágenes corruptas o placeholders
        if (producto.imagen && (producto.imagen.includes('FFFFF') || producto.imagen.includes('text=Instrumento'))) {
            // Mensaje de depuración para imágenes problemáticas
            console.log(`🔄 Limpiando imagen corrupta para: ${producto.nombre}`);
            // Asignar valor vacío para forzar el uso de placeholder
            producto.imagen = '';
        }
        
        // Asegurar que los IDs sean números (evitar problemas de tipo string)
        if (producto.categoria_id) producto.categoria_id = parseInt(producto.categoria_id);
        if (producto.marca_id) producto.marca_id = parseInt(producto.marca_id);
        
        // Devolver el producto modificado
        return producto;
    });
}

// Función para verificar el estado de las imágenes de los productos
function verificarImagenesProductos() {
    // Mensaje de depuración
    console.log('Verificando imágenes de productos...');
    
    // Contador de imágenes problemáticas
    let imagenesCorruptas = 0;
    
    // Recorrer todos los productos para verificar sus imágenes
    todosLosProductos.forEach((producto, index) => {
        // Verificar si el producto tiene imagen
        const tieneImagen = !!producto.imagen;
        // Verificar si la ruta de imagen es válida (no contiene indicadores de placeholder)
        const esRutaValida = producto.imagen && 
                            !producto.imagen.includes('FFFFF') && 
                            !producto.imagen.includes('text=Instrumento');
        
        // Si tiene imagen pero la ruta no es válida
        if (!esRutaValida && tieneImagen) {
            // Incrementar contador de imágenes problemáticas
            imagenesCorruptas++;
            // Mostrar advertencia en consola con detalles
            console.warn(`Imagen problemática encontrada en producto ${index + 1}:`, {
                nombre: producto.nombre,
                imagen: producto.imagen
            });
        }
    });
    
    // Mostrar resumen de verificación de imágenes
    console.log(`Resumen imágenes: ${imagenesCorruptas} imágenes problemáticas de ${todosLosProductos.length} productos`);
}


// Función para renderizar los botones de categorías en la interfaz
function renderizarBotonesCategorias() {
    // Obtener el contenedor de botones de categorías del DOM
    const container = document.getElementById('categoriasContainer');
    // Si no existe el contenedor, salir de la función
    if (!container) return;
    
    // Buscar el botón "Todas" que ya existe en el contenedor
    const btnTodas = container.querySelector('.filter-button[data-valor=""]');
    // Limpiar el contenido del contenedor
    container.innerHTML = '';
    // Si existe el botón "Todas", agregarlo de nuevo al contenedor
    if (btnTodas) {
        container.appendChild(btnTodas);
    }
    
    // Para cada categoría, crear un botón de filtro
    categorias.forEach(categoria => {
        // Crear elemento button
        const button = document.createElement('button');
        // Asignar clases CSS
        button.className = 'filter-button';
        // Establecer atributos personalizados para identificar el tipo y valor
        button.setAttribute('data-tipo', 'categoria');
        button.setAttribute('data-valor', categoria.id);
        // Establecer el texto del botón como el nombre de la categoría
        button.textContent = categoria.nombre;
        
        // Agregar event listener para el click en el botón
        button.addEventListener('click', function() {
            // Manejar la selección del filtro
            manejarFiltro('categoria', categoria.id, this);
        });
        
        // Agregar el botón al contenedor
        container.appendChild(button);
    });
}

// Función para renderizar los botones de marcas en la interfaz
function renderizarBotonesMarcas() {
    // Obtener el contenedor de botones de marcas del DOM
    const container = document.getElementById('marcasContainer');
    // Si no existe el contenedor, salir de la función
    if (!container) return;
    
    // Buscar el botón "Todas" que ya existe en el contenedor
    const btnTodas = container.querySelector('.filter-button[data-valor=""]');
    // Limpiar el contenido del contenedor
    container.innerHTML = '';
    // Si existe el botón "Todas", agregarlo de nuevo al contenedor
    if (btnTodas) {
        container.appendChild(btnTodas);
    }
    
    // Para cada marca, crear un botón de filtro
    marcas.forEach(marca => {
        // Crear elemento button
        const button = document.createElement('button');
        // Asignar clases CSS
        button.className = 'filter-button';
        // Establecer atributos personalizados para identificar el tipo y valor
        button.setAttribute('data-tipo', 'marca');
        button.setAttribute('data-valor', marca.id);
        // Establecer el texto del botón como el nombre de la marca
        button.textContent = marca.nombre;
        
        // Agregar event listener para el click en el botón
        button.addEventListener('click', function() {
            // Manejar la selección del filtro
            manejarFiltro('marca', marca.id, this);
        });
        
        // Agregar el botón al contenedor
        container.appendChild(button);
    });
}



// Función para manejar la selección de un filtro
function manejarFiltro(tipo, valor, elemento) {
    // Mensaje de depuración
    console.log(`Aplicando filtro de ${tipo}: ${valor}`);
    
    // Remover la clase 'active' de todos los botones del mismo tipo
    document.querySelectorAll(`.filter-button[data-tipo="${tipo}"]`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar la clase 'active' al botón que fue clickeado
    elemento.classList.add('active');
    // Actualizar el filtro activo con el nuevo valor
    filtrosActivos[tipo] = valor;
    
    // Aplicar los cambios recalculando filtros y re-renderizando
    aplicarFiltrosYOrdenamiento();
}



// Función principal que aplica filtros y ordenamiento
function aplicarFiltrosYOrdenamiento() {
    // Mensaje de depuración
    console.log('Aplicando filtros y ordenamiento...', filtrosActivos);
    
    // Filtrar los productos según los filtros activos
    let productosFiltrados = filtrarProductos();
    // Ordenar los productos filtrados según el criterio actual
    let productosOrdenados = ordenarProductos(productosFiltrados);
    
    // Renderizar los productos en la interfaz
    renderizarProductos(productosOrdenados);
    // Actualizar los contadores de productos
    actualizarContadores(todosLosProductos.length, productosFiltrados.length);
}

// Función para filtrar productos según los criterios activos
function filtrarProductos() {
    // Crear una copia del array de todos los productos
    let productos = [...todosLosProductos];
    
    // Mensajes de depuración detallados
    console.log('Depuración de filtros:');
    console.log('Filtros activos:', filtrosActivos);
    console.log('Total productos antes de filtrar:', productos.length);
    
    // Filtrar por categoría si hay un filtro activo
    if (filtrosActivos.categoria) {
        // Guardar la cantidad de productos antes del filtro
        const antes = productos.length;
        // Aplicar filtro por categoría
        productos = productos.filter(p => p.categoria_id == filtrosActivos.categoria);
        // Mostrar resultado del filtro en consola
        console.log(`Filtro categoría ${filtrosActivos.categoria}: ${antes} → ${productos.length}`);
    }
    
    // Filtrar por marca si hay un filtro activo
    if (filtrosActivos.marca) {
        // Guardar la cantidad de productos antes del filtro
        const antes = productos.length;
        // Aplicar filtro por marca
        productos = productos.filter(p => p.marca_id == filtrosActivos.marca);
        // Mostrar resultado del filtro en consola
        console.log(`Filtro marca ${filtrosActivos.marca}: ${antes} → ${productos.length}`);
    }
    
    // Mostrar resultado final del filtrado
    console.log(`Total de productos después de filtrar: ${productos.length}`);
    
    // Mostrar nombres de productos filtrados para depuración avanzada
    if (productos.length > 0) {
        console.log('Productos después del filtrado:', productos.map(p => p.nombre));
    } else {
        console.log('No hay productos después del filtrado');
    }
    
    // Devolver los productos filtrados
    return productos;
}

// Función para ordenar productos según el criterio seleccionado
function ordenarProductos(productos) {
    // Crear una copia del array para no modificar el original
    const productosCopia = [...productos];
    
    // Aplicar diferentes algoritmos de ordenamiento según el criterio
    switch (ordenActual) {
        case 'precio-asc':
            // Ordenar por precio de menor a mayor
            console.log('Ordenando por precio: menor a mayor');
            return productosCopia.sort((a, b) => a.precio - b.precio);
            
        case 'precio-desc':
            // Ordenar por precio de mayor a menor
            console.log('Ordenando por precio: mayor a menor');
            return productosCopia.sort((a, b) => b.precio - a.precio);
            
        case 'nombre-asc':
            // Ordenar alfabéticamente por nombre (A-Z)
            console.log('Ordenando por nombre: A-Z');
            return productosCopia.sort((a, b) => a.nombre.localeCompare(b.nombre));
            
        case 'recomendados':
        default:
            // No aplicar ordenamiento específico (orden original)
            console.log('Mostrando productos recomendados (sin orden específico)');
            return productosCopia;
    }
}


// Función para actualizar los contadores de productos en la interfaz
function actualizarContadores(total, filtrado) {
    // Obtener elementos del DOM para los contadores
    const contadorProductos = document.getElementById('contadorProductos');
    const contadorFiltrado = document.getElementById('contadorFiltrado');
    
    // Actualizar contador de productos totales
    if (contadorProductos) {
        contadorProductos.textContent = `${total} productos`;
    }
    
    // Actualizar contador de productos filtrados (solo si hay filtros activos)
    if (contadorFiltrado) {
        if (filtrado !== total) {
            // Mostrar contador cuando hay productos filtrados
            contadorFiltrado.textContent = `Mostrando ${filtrado} de ${total} productos`;
        } else {
            // Ocultar contador cuando no hay filtros activos
            contadorFiltrado.textContent = '';
        }
    }
}

// Función para renderizar los productos en el grid
function renderizarProductos(productos) {
    // Obtener el contenedor de productos del DOM
    const container = document.getElementById('productosContainer');
    // Si no existe el contenedor, salir de la función
    if (!container) return;
    
    // Verificar si no hay productos para mostrar
    if (productos.length === 0) {
        // Mostrar estado vacío con mensaje amigable
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search empty-state-icon"></i>
                <p class="empty-state-text">No se encontraron productos</p>
                <p class="empty-state-subtext">Intenta con otros filtros</p>
            </div>
        `;
        return;
    }
    
    // Convertir array de productos a HTML y actualizar el contenedor
   // Convertir array de productos a HTML y actualizar el contenedor
container.innerHTML = productos.map(producto => crearTarjetaProducto(producto)).join('');

// Después de renderizar, conectar los botones de carrito (si existe la función)
if (typeof conectarBotonesCarrito === 'function') {
    conectarBotonesCarrito();
}
}



// Función para crear el HTML de una tarjeta de producto individual
function crearTarjetaProducto(producto) {
    // CORREGIDO: Manejo robusto de URLs de imágenes con múltiples formatos
    
    let imagenUrl = '';
    
    // Verificar diferentes formatos de URLs de imágenes
    if (producto.imagen) {
        // Caso 1: Si la imagen ya es una URL completa (http:// o https://)
        if (producto.imagen.startsWith('http')) {
            imagenUrl = producto.imagen;
        } 
        // Caso 2: Si la imagen empieza con / (ruta absoluta del servidor)
        else if (producto.imagen.startsWith('/')) {
            imagenUrl = `http://localhost:4000${producto.imagen}`;
        }
        // Caso 3: Si es solo un nombre de archivo (sin ruta)
        else {
            imagenUrl = `http://localhost:4000/uploads/productos/${producto.imagen}`;
        }
    } else {
        // Caso 4: No hay imagen - usar placeholder seguro
        imagenUrl = 'https://via.placeholder.com/300x200/4B5563/FFFFFF?text=Sin+Imagen';
    }
    
    // Formatear el precio como moneda mexicana
    const precioFormateado = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(producto.precio);
    
    // Buscar el nombre de la categoría usando el ID
    const categoriaNombre = categorias.find(c => c.id == producto.categoria_id)?.nombre || 'Categoría';
    // Buscar el nombre de la marca usando el ID
    const marcaNombre = marcas.find(m => m.id == producto.marca_id)?.nombre || 'Marca';
    
    // Devolver el HTML completo de la tarjeta del producto
    return `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${imagenUrl}" alt="${producto.nombre}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x200/4B5563/FFFFFF?text=Error+Imagen'">
                <span class="product-badge">Nuevo</span>
            </div>
            
            <div class="product-info">
                <h3 class="product-name text-truncate-2">${producto.nombre}</h3>
                
                <div class="product-price-container">
                    <span class="product-price">${precioFormateado}</span>
                    <span class="product-brand">${marcaNombre}</span>
                </div>
                
                <p class="product-description text-truncate-2">
                    ${producto.descripcion || 'Instrumento musical de alta calidad.'}
                </p>
                
                <div class="product-category">
                    <span>Categoría: ${categoriaNombre}</span>
                </div>
                
               <button class="add-to-cart-button" data-producto-id="${producto.id}">
                <i class="fas fa-shopping-cart cart-button-icon"></i>
                <span>Agregar al carrito</span>
</button>

            </div>
        </div>
    `;
}



// Función para configurar los event listeners de la subida de imágenes
function configurarSubidaImagenes() {
    // Obtener elementos del DOM relacionados con la subida de imágenes
    const imagenInput = document.getElementById('imagenInput');
    const subirImagenBtn = document.getElementById('subirImagenBtn');
    const limpiarFormBtn = document.getElementById('limpiarFormBtn');
    const fileName = document.getElementById('fileName');

    // Configurar event listener para el input de archivo
    if (imagenInput) {
        imagenInput.addEventListener('change', function(e) {
            // Actualizar el texto que muestra el nombre del archivo seleccionado
            if (this.files.length > 0) {
                fileName.textContent = this.files[0].name;
            } else {
                fileName.textContent = 'No se eligió ningún archivo';
            }
        });
    }

    // Configurar event listener para el botón de subir imagen
    if (subirImagenBtn) {
        subirImagenBtn.addEventListener('click', subirImagen);
    }

    // Configurar event listener para el botón de limpiar formulario
    if (limpiarFormBtn) {
        limpiarFormBtn.addEventListener('click', limpiarFormularioImagen);
    }
}

// Función para cargar los productos en el selector del formulario de subida
function cargarProductosParaSelector() {
    // Obtener el elemento select del DOM
    const select = document.getElementById('productoSelect');
    // Si no existe, salir de la función
    if (!select) return;

    // Limpiar y resetear las opciones del selector
    select.innerHTML = '<option value="">Selecciona un producto</option>';

    // Para cada producto, crear una opción en el selector
    todosLosProductos.forEach(producto => {
        // Crear elemento option
        const option = document.createElement('option');
        // Establecer el valor como el ID del producto
        option.value = producto.id;
        // Establecer el texto como el nombre del producto
        option.textContent = producto.nombre;
        // Agregar la opción al selector
        select.appendChild(option);
    });
}

// Función asíncrona para manejar la subida de imágenes
async function subirImagen() {
    // Obtener elementos del DOM necesarios para la subida
    const productoSelect = document.getElementById('productoSelect');
    const imagenInput = document.getElementById('imagenInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const subirImagenBtn = document.getElementById('subirImagenBtn');

    // Validación 1: Verificar que se seleccionó un producto
    if (!productoSelect.value) {
        mostrarEstadoUpload('Por favor selecciona un producto', 'error');
        return;
    }

    // Validación 2: Verificar que se seleccionó un archivo
    if (!imagenInput.files.length) {
        mostrarEstadoUpload('Por favor selecciona una imagen', 'error');
        return;
    }

    // Obtener el archivo seleccionado
    const file = imagenInput.files[0];
    
    // Validación 3: Verificar que el archivo es una imagen
    if (!file.type.startsWith('image/')) {
        mostrarEstadoUpload('Solo se permiten archivos de imagen (JPEG, PNG, GIF)', 'error');
        return;
    }

    // Validación 4: Verificar que el tamaño no excede 5MB
    if (file.size > 5 * 1024 * 1024) {
        mostrarEstadoUpload('La imagen no debe superar los 5MB', 'error');
        return;
    }

    try {
        // Deshabilitar el botón durante la subida para evitar múltiples clicks
        subirImagenBtn.disabled = true;
        // Cambiar el texto del botón para indicar progreso
        subirImagenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';

        // Mostrar estado de subida en progreso
        mostrarEstadoUpload('Subiendo imagen...', 'warning');

        // Crear FormData para enviar el archivo
        const formData = new FormData();
        // Agregar el archivo al FormData con el nombre 'imagen'
        formData.append('imagen', file);

        // Paso 1: Subir la imagen al servidor
        const uploadResponse = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        // Verificar si la respuesta del servidor fue exitosa
        if (!uploadResponse.ok) {
            throw new Error(`Error del servidor: ${uploadResponse.status}`);
        }

        // Convertir la respuesta a JSON
        const uploadData = await uploadResponse.json();

        // Verificar si la subida fue exitosa según la respuesta del servidor
        if (!uploadData.success) {
            throw new Error(uploadData.error || 'Error al subir la imagen');
        }

        // VERIFICACIÓN EXTRA: Validar que la URL de imagen recibida sea válida
        if (!uploadData.imageUrl || uploadData.imageUrl.includes('FFFFF')) {
            throw new Error('URL de imagen inválida recibida del servidor');
        }

        // Paso 2: Actualizar el producto con la nueva URL de imagen
        const updateResponse = await fetch(`${API_URL}/productos/${productoSelect.value}/imagen`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imagen_url: uploadData.imageUrl
            })
        });

        // Verificar si la actualización fue exitosa
        if (!updateResponse.ok) {
            throw new Error(`Error al actualizar producto: ${updateResponse.status}`);
        }

        // Convertir la respuesta de actualización a JSON
        const updateData = await updateResponse.json();

        // Mostrar mensaje de éxito
        mostrarEstadoUpload('¡Imagen subida y asignada exitosamente!', 'success');
        
        // Limpiar el formulario
        limpiarFormularioImagen();
        
        // Recargar productos después de un breve delay para mostrar los cambios
        setTimeout(() => {
            cargarProductos();
        }, 1500);

    } catch (error) {
        // Manejar errores durante el proceso de subida
        console.error('Error en la subida de imagen:', error);
        // Mostrar mensaje de error al usuario
        mostrarEstadoUpload(`Error: ${error.message}`, 'error');
    } finally {
        // Rehabilitar el botón independientemente del resultado
        subirImagenBtn.disabled = false;
        // Restaurar el texto original del botón
        subirImagenBtn.innerHTML = '<i class="fas fa-upload"></i> Subir Imagen';
    }
}

// Función para mostrar el estado de la subida en la interfaz
function mostrarEstadoUpload(mensaje, tipo) {
    // Obtener el elemento de estado del DOM
    const uploadStatus = document.getElementById('uploadStatus');
    // Si no existe, salir de la función
    if (!uploadStatus) return;

    // Establecer el texto del mensaje
    uploadStatus.textContent = mensaje;
    // Establecer la clase CSS según el tipo (success, error, warning)
    uploadStatus.className = 'upload-status ' + tipo;
}

// Función para limpiar el formulario de subida de imágenes
function limpiarFormularioImagen() {
    // Obtener elementos del DOM del formulario
    const imagenInput = document.getElementById('imagenInput');
    const fileName = document.getElementById('fileName');
    const uploadStatus = document.getElementById('uploadStatus');

    // Limpiar el input de archivo
    if (imagenInput) imagenInput.value = '';
    // Restablecer el texto del nombre de archivo
    if (fileName) fileName.textContent = 'No se eligió ningún archivo';
    // Limpiar el mensaje de estado
    if (uploadStatus) {
        uploadStatus.textContent = '';
        uploadStatus.className = 'upload-status';
    }
}



// Función para mostrar un estado de error en la interfaz
function mostrarError(mensaje) {
    // Obtener el contenedor de productos del DOM
    const container = document.getElementById('productosContainer');
    // Si no existe, salir de la función
    if (!container) return;
    
    // Mostrar estado de error con icono y mensajes
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle error-state-icon"></i>
            <p class="error-state-text">${mensaje}</p>
            <p class="error-state-subtext">Intenta recargar la página</p>
        </div>
    `;
}



// Función para limpiar todos los filtros activos
function limpiarTodosLosFiltros() {
    // Mensaje de depuración
    console.log('Limpiando todos los filtros');
    
    // Resetear todos los filtros a valores vacíos
    filtrosActivos = { categoria: '', marca: '' };
    
    // Remover la clase 'active' de todos los botones de filtro
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar solo los botones "Todas" (valor vacío)
    document.querySelectorAll('.filter-button[data-valor=""]').forEach(btn => {
        btn.classList.add('active');
    });
    
    // Aplicar los cambios recalculando y re-renderizando
    aplicarFiltrosYOrdenamiento();
}