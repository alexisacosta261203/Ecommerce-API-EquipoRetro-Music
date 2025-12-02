// ------------------ DATOS EN MEMORIA (INSTRUMENTOS) ------------------

// Datos de ejemplo para que la vista se vea similar a tus tarjetas de tienda
let products = [
    {
        id: 1,
        name: "Fender Edición limitada California Vintage Malibu",
        brand: "Fender",
        category: "guitarras",
        price: 19999,
        stock: 6,
        description: "Guitarra acústica de concierto Malibu con tapa de abeto y fondo de caoba.",
        image: "",
    },
    {
        id: 2,
        name: "Fender Malibu Special Mahogany",
        brand: "Fender",
        category: "guitarras",
        price: 13179,
        stock: 4,
        description: "Cuerpo de caoba, sonido cálido y cómodo para tocar.",
        image: "",
    },
    {
        id: 3,
        name: "Fender Guitarra Electroacústica Fa-25ce",
        brand: "Fender",
        category: "guitarras-electricas",
        price: 3499,
        stock: 10,
        description: "Electroacústica ideal para escenario y práctica en casa.",
        image: "",
    }
];

let nextId = 4;

// ventas
let sales = [];
let totalCompanySales = 0;

// chart
let salesChart = null;

const categoryLabels = {
    "guitarras": "Guitarras",
    "guitarras-electricas": "Guitarras eléctricas",
    "bajos": "Bajos",
    "baterias": "Baterías"
};

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
    const summaryGuitarras = document.getElementById("summary-guitarras");
    const summaryBajos = document.getElementById("summary-bajos");
    const summaryBaterias = document.getElementById("summary-baterias");

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

    // -------------- LOGIN / LOGOUT --------------

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
            menuButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            Object.keys(sections).forEach(key => {
                sections[key].classList.remove("active");
            });
            if (sections[target]) {
                sections[target].classList.add("active");
            }
        });
    });

    // -------------- UTILIDADES --------------

    function formatCurrency(value) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0
        }).format(value);
    }

    // -------------- RESUMEN / REPORTES --------------

    function renderSummary() {
        summaryTotal.textContent = products.length;
        summaryGuitarras.textContent = products.filter(p => p.category === "guitarras").length;
        summaryBajos.textContent = products.filter(p => p.category === "bajos").length;
        summaryBaterias.textContent = products.filter(p => p.category === "baterias").length;
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
            li.textContent = "No hay instrumentos registrados.";
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
        totalCompanySalesLabel.textContent = formatCurrency(totalCompanySales);
    }

    // -------------- TABLA DE PRODUCTOS --------------

    function renderProductsTable() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCategory = filterCategory.value;

        let filtered = products.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm);

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
                        <div class="prod-sub">${product.brand}</div>
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
                if (product.category === "guitarras") tag.classList.add("tag-guitarras");
                if (product.category === "guitarras-electricas") tag.classList.add("tag-guitarras-electricas");
                if (product.category === "bajos") tag.classList.add("tag-bajos");
                if (product.category === "baterias") tag.classList.add("tag-baterias");
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

        productsCounter.textContent = `${filtered.length} instrumento(s) en el catálogo.`;
        renderSummary();
        renderStockReport();
        fillSaleSelect();
    }

    function fillSaleSelect() {
        saleProductSelect.innerHTML = "";
        if (products.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "No hay instrumentos";
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

    // -------------- FORMULARIO PRODUCTO --------------

    const editingIdInput = document.getElementById("editingId");
    const formTitle = document.getElementById("formTitle");
    const formSubtitle = document.getElementById("formSubtitle");
    const submitLabel = document.getElementById("submitLabel");

    function resetForm() {
        productForm.reset();
        editingIdInput.value = "";
        formTitle.textContent = "Agregar instrumento";
        formSubtitle.textContent = "Completa los campos para añadir un nuevo instrumento al catálogo.";
        submitLabel.textContent = "Guardar producto";
    }

    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const brand = document.getElementById("brand").value.trim();
        const category = document.getElementById("category").value;
        const price = parseFloat(document.getElementById("price").value);
        const stock = parseInt(document.getElementById("stock").value, 10);
        const image = document.getElementById("image").value.trim();
        const description = document.getElementById("description").value.trim();

        if (!name || !brand || !category || isNaN(price) || isNaN(stock)) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        const editingId = editingIdInput.value;

        if (editingId) {
            const id = parseInt(editingId, 10);
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    name,
                    brand,
                    category,
                    price,
                    stock,
                    image,
                    description
                };
            }
        } else {
            products.push({
                id: nextId++,
                name,
                brand,
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

    // editar / eliminar desde tabla
    productsTableBody.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete");
        const editBtn = e.target.closest(".btn-edit");

        if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id, 10);
            if (!confirm("¿Seguro que deseas eliminar este instrumento?")) return;
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
            document.getElementById("brand").value = product.brand;
            document.getElementById("category").value = product.category;
            document.getElementById("price").value = product.price;
            document.getElementById("stock").value = product.stock;
            document.getElementById("image").value = product.image || "";
            document.getElementById("description").value = product.description || "";

            formTitle.textContent = "Editar instrumento";
            formSubtitle.textContent = "Modifica los campos y guarda para ver los cambios en la tabla.";
            submitLabel.textContent = "Actualizar producto";

            productForm.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    // búsqueda / filtro
    searchInput.addEventListener("input", renderProductsTable);
    filterCategory.addEventListener("change", renderProductsTable);

    // -------------- VENTAS --------------

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
                        label: "Ventas por instrumento (MXN)",
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
            alert("Selecciona un instrumento válido.");
            return;
        }

        if (product.stock === 0 || quantity > product.stock) {
            alert("Por el momento este producto no está disponible o no hay stock suficiente.");
            return;
        }

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
