// ------------------ DATOS EN MEMORIA ------------------

let products = [
    {
        id: 1,
        name: "Thriller (Edición vinilo)",
        artist: "Michael Jackson",
        category: "vinilo",
        price: 599,
        stock: 8,
        description: "Clásico en vinilo, portada original.",
        image: ""
    },
    {
        id: 2,
        name: "Nevermind",
        artist: "Nirvana",
        category: "cd",
        price: 349,
        stock: 12,
        description: "Edición CD remasterizada.",
        image: ""
    },
    {
        id: 3,
        name: "Back in Black",
        artist: "AC/DC",
        category: "cassette",
        price: 199,
        stock: 5,
        description: "Cassette clásico ochentero.",
        image: ""
    }
];

let nextId = 4;

// ventas
let sales = [];
let totalCompanySales = 0;

// chart
let salesChart = null;

const categoryLabels = {
    vinilo: "Vinilo",
    cassette: "Cassette",
    cd: "CD",
    playera: "Playera",
    poster: "Poster"
};

// ------------------ INICIO ------------------

document.addEventListener("DOMContentLoaded", () => {
    // elementos base
    const productForm = document.getElementById("productForm");
    const resetFormBtn = document.getElementById("resetFormBtn");
    const scrollToFormBtn = document.getElementById("scrollToFormBtn");
    const productsTableBody = document.getElementById("productsTableBody");
    const emptyState = document.getElementById("emptyState");
    const productsCounter = document.getElementById("productsCounter");
    const searchInput = document.getElementById("searchInput");
    const filterCategory = document.getElementById("filterCategory");

    const summaryTotal = document.getElementById("summary-total");
    const summaryVinilos = document.getElementById("summary-vinilos");
    const summaryCassettes = document.getElementById("summary-cassettes");
    const summaryCds = document.getElementById("summary-cds");

    const stockReportList = document.getElementById("stockReportList");
    const totalCompanySalesLabel = document.getElementById("totalCompanySales");

    // ventas
    const saleForm = document.getElementById("saleForm");
    const saleProductSelect = document.getElementById("saleProduct");
    const saleQuantityInput = document.getElementById("saleQuantity");
    const salesTableBody = document.getElementById("salesTableBody");
    const salesEmptyState = document.getElementById("salesEmptyState");

    // login
    const adminNameLabel = document.getElementById("adminNameLabel");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // navegación secciones
    const menuButtons = document.querySelectorAll(".menu-btn");
    const sections = {
        productos: document.getElementById("section-productos"),
        ordenes: document.getElementById("section-ordenes"),
        usuarios: document.getElementById("section-usuarios"),
        ajustes: document.getElementById("section-ajustes")
    };

    // -------------- LOGIN / LOGOUT (puntos 14, 22, 23) --------------

    function refreshSessionUI() {
        const stored = localStorage.getItem("adminUser");
        if (stored) {
            adminNameLabel.textContent = stored;
            loginBtn.style.display = "none";
            logoutBtn.style.display = "inline-flex";
            document.body.classList.add("admin-logged");
        } else {
            adminNameLabel.textContent = "No autenticado";
            loginBtn.style.display = "inline-flex";
            logoutBtn.style.display = "none";
            document.body.classList.remove("admin-logged");
        }
    }

    loginBtn.addEventListener("click", () => {
        const name = prompt("Nombre del administrador:", "Kevin");
        if (!name) return;
        localStorage.setItem("adminUser", name.trim());
        refreshSessionUI();
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("adminUser");
        refreshSessionUI();
    });

    refreshSessionUI();

    // -------------- NAVEGACIÓN LATERAL --------------

    menuButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-section");

            // activar botón
            menuButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // mostrar sección
            Object.keys(sections).forEach(key => {
                sections[key].classList.remove("active");
            });
            if (sections[target]) {
                sections[target].classList.add("active");
            }
        });
    });

    // -------------- RESUMEN / REPORTES --------------

    function renderSummary() {
        summaryTotal.textContent = products.length;
        summaryVinilos.textContent = products.filter(p => p.category === "vinilo").length;
        summaryCassettes.textContent = products.filter(p => p.category === "cassette").length;
        summaryCds.textContent = products.filter(p => p.category === "cd").length;
    }

    function renderStockReport() {
        const byCategory = {};

        products.forEach(p => {
            if (!byCategory[p.category]) {
                byCategory[p.category] = 0;
            }
            byCategory[p.category] += p.stock;
        });

        stockReportList.innerHTML = "";

        if (Object.keys(byCategory).length === 0) {
            const li = document.createElement("li");
            li.textContent = "No hay productos registrados.";
            stockReportList.appendChild(li);
            return;
        }

        Object.keys(byCategory).forEach(cat => {
            const li = document.createElement("li");
            const label = categoryLabels[cat] || cat;
            li.textContent = `${label}: ${byCategory[cat]} unidades en existencia`;
            stockReportList.appendChild(li);
        });
    }

    function renderTotalSales() {
        totalCompanySalesLabel.textContent = new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0
        }).format(totalCompanySales);
    }

    // -------------- TABLA DE PRODUCTOS (altas, bajas, cambios) --------------

    function formatCurrency(value) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0
        }).format(value);
    }

    function renderProductsTable() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCategory = filterCategory.value;

        let filtered = products.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm) ||
                p.artist.toLowerCase().includes(searchTerm);

            const matchesCategory =
                selectedCategory === "todas" || p.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        productsTableBody.innerHTML = "";

        if (filtered.length === 0) {
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";

            filtered.forEach(product => {
                const tr = document.createElement("tr");
                if (product.stock === 0) {
                    tr.classList.add("no-stock");
                }

                const tdInfo = document.createElement("td");
                tdInfo.innerHTML = `
                    <div class="prod-info">
                        <div class="prod-main">${product.name}</div>
                        <div class="prod-sub">${product.artist}</div>
                        ${
                            product.stock === 0
                                ? '<div class="no-stock-message">Por el momento este producto no está disponible</div>'
                                : ""
                        }
                    </div>
                `;

                const tdCategory = document.createElement("td");
                const tag = document.createElement("span");
                tag.classList.add("tag");
                if (product.category === "vinilo") tag.classList.add("tag-vinilo");
                if (product.category === "cassette") tag.classList.add("tag-cassette");
                if (product.category === "cd") tag.classList.add("tag-cd");
                tag.textContent = categoryLabels[product.category] || product.category;
                tdCategory.appendChild(tag);

                const tdPrice = document.createElement("td");
                tdPrice.textContent = formatCurrency(product.price);

                const tdStock = document.createElement("td");
                tdStock.textContent = product.stock;

                const tdActions = document.createElement("td");
                tdActions.classList.add("actions-cell");
                tdActions.innerHTML = `
                    <button class="btn-table btn-edit" data-id="${product.id}">
                        ✏️ Editar
                    </button>
                    <button class="btn-table btn-delete" data-id="${product.id}">
                        🗑️ Eliminar
                    </button>
                `;

                tr.appendChild(tdInfo);
                tr.appendChild(tdCategory);
                tr.appendChild(tdPrice);
                tr.appendChild(tdStock);
                tr.appendChild(tdActions);

                productsTableBody.appendChild(tr);
            });
        }

        productsCounter.textContent = `${filtered.length} producto(s) en el catálogo.`;
        renderSummary();
        renderStockReport();
        fillSaleSelect();
    }

    // llenar select de ventas
    function fillSaleSelect() {
        saleProductSelect.innerHTML = "";
        if (products.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "No hay productos";
            saleProductSelect.appendChild(opt);
            return;
        }

        products.forEach(p => {
            const opt = document.createElement("option");
            opt.value = String(p.id);
            opt.textContent = `${p.name} (${p.stock} en stock)`;
            saleProductSelect.appendChild(opt);
        });
    }

    // -------------- FORMULARIO PRODUCTO (alta / edición) --------------

    const editingIdInput = document.getElementById("editingId");
    const formTitle = document.getElementById("formTitle");
    const formSubtitle = document.getElementById("formSubtitle");
    const submitLabel = document.getElementById("submitLabel");

    function resetForm() {
        productForm.reset();
        editingIdInput.value = "";
        formTitle.textContent = "Agregar producto";
        formSubtitle.textContent = "Completa los campos para añadir un nuevo artículo al catálogo.";
        submitLabel.textContent = "Guardar producto";
    }

    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const artist = document.getElementById("artist").value.trim();
        const category = document.getElementById("category").value;
        const price = parseFloat(document.getElementById("price").value);
        const stock = parseInt(document.getElementById("stock").value, 10);
        const image = document.getElementById("image").value.trim();
        const description = document.getElementById("description").value.trim();

        if (!name || !artist || !category || isNaN(price) || isNaN(stock)) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        const editingId = editingIdInput.value;

        if (editingId) {
            // actualización (punto 17)
            const id = parseInt(editingId, 10);
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    name,
                    artist,
                    category,
                    price,
                    stock,
                    image,
                    description
                };
            }
        } else {
            // alta (punto 15)
            products.push({
                id: nextId++,
                name,
                artist,
                category,
                price,
                stock,
                image,
                description
            });
        }

        resetForm();
        renderProductsTable();
    });

    resetFormBtn.addEventListener("click", () => {
        resetForm();
    });

    scrollToFormBtn.addEventListener("click", () => {
        productForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // eliminar / editar desde la tabla (puntos 16 y 17)
    productsTableBody.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete");
        const editBtn = e.target.closest(".btn-edit");

        if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id, 10);
            products = products.filter(p => p.id !== id);
            renderProductsTable();
            return;
        }

        if (editBtn) {
            const id = parseInt(editBtn.dataset.id, 10);
            const product = products.find(p => p.id === id);
            if (!product) return;

            editingIdInput.value = product.id;
            document.getElementById("name").value = product.name;
            document.getElementById("artist").value = product.artist;
            document.getElementById("category").value = product.category;
            document.getElementById("price").value = product.price;
            document.getElementById("stock").value = product.stock;
            document.getElementById("image").value = product.image || "";
            document.getElementById("description").value = product.description || "";

            formTitle.textContent = "Editar producto";
            formSubtitle.textContent = "Modifica los campos y guarda para ver los cambios en la tabla.";
            submitLabel.textContent = "Actualizar producto";

            productForm.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    // búsqueda / filtro
    searchInput.addEventListener("input", renderProductsTable);
    filterCategory.addEventListener("change", renderProductsTable);

    // -------------- VENTAS (puntos 18, 19, 20, 21) --------------

    function renderSalesTable() {
        salesTableBody.innerHTML = "";

        if (sales.length === 0) {
            salesEmptyState.style.display = "block";
            return;
        }

        salesEmptyState.style.display = "none";

        sales.forEach(sale => {
            const tr = document.createElement("tr");

            const tdProduct = document.createElement("td");
            tdProduct.textContent = sale.productName;

            const tdQty = document.createElement("td");
            tdQty.textContent = sale.quantity;

            const tdAmount = document.createElement("td");
            tdAmount.textContent = formatCurrency(sale.total);

            const tdDate = document.createElement("td");
            tdDate.textContent = sale.date.toLocaleString("es-MX");

            tr.appendChild(tdProduct);
            tr.appendChild(tdQty);
            tr.appendChild(tdAmount);
            tr.appendChild(tdDate);

            salesTableBody.appendChild(tr);
        });
    }

    function initChart() {
        const ctx = document.getElementById("salesChart").getContext("2d");
        salesChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Ventas por producto (MXN)",
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateChart() {
        if (!salesChart) return;

        const grouped = {};
        sales.forEach(sale => {
            if (!grouped[sale.productName]) {
                grouped[sale.productName] = 0;
            }
            grouped[sale.productName] += sale.total;
        });

        salesChart.data.labels = Object.keys(grouped);
        salesChart.data.datasets[0].data = Object.values(grouped);
        salesChart.update();
    }

    saleForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const productId = parseInt(saleProductSelect.value, 10);
        const quantity = parseInt(saleQuantityInput.value, 10);

        const product = products.find(p => p.id === productId);
        if (!product) {
            alert("Selecciona un producto válido.");
            return;
        }

        if (product.stock === 0 || quantity > product.stock) {
            // comportamiento cuando stock = 0 (punto 21)
            alert("Por el momento este producto no está disponible o no hay stock suficiente.");
            return;
        }

        // reducir inventario
        product.stock -= quantity;

        const total = product.price * quantity;
        totalCompanySales += total;

        sales.push({
            productId,
            productName: product.name,
            quantity,
            total,
            date: new Date()
        });

        saleForm.reset();
        renderProductsTable();
        renderSalesTable();
        renderTotalSales();
        updateChart();
    });

    // -------------- INICIALIZACIÓN --------------

    initChart();
    renderProductsTable();
    renderSalesTable();
    renderTotalSales();
});
