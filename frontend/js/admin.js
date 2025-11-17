// Datos iniciales de ejemplo
let products = [
    {
        id: 1,
        name: "Thriller (Edición vinilo)",
        artist: "Michael Jackson",
        category: "vinilo",
        price: 599,
        stock: 8
    },
    {
        id: 2,
        name: "Nevermind",
        artist: "Nirvana",
        category: "cd",
        price: 349,
        stock: 12
    },
    {
        id: 3,
        name: "Back in Black",
        artist: "AC/DC",
        category: "cassette",
        price: 199,
        stock: 5
    }
];

let nextId = 4;

const categoryLabels = {
    vinilo: "Vinilo",
    cassette: "Cassette",
    cd: "CD",
    playera: "Playera",
    poster: "Poster"
};

document.addEventListener("DOMContentLoaded", () => {
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

    function formatCurrency(value) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0
        }).format(value);
    }

    function renderSummary(list) {
        summaryTotal.textContent = list.length;
        summaryVinilos.textContent = list.filter(p => p.category === "vinilo").length;
        summaryCassettes.textContent = list.filter(p => p.category === "cassette").length;
        summaryCds.textContent = list.filter(p => p.category === "cd").length;
    }

    function renderTable() {
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

                const tdInfo = document.createElement("td");
                tdInfo.innerHTML = `
                    <div class="prod-info">
                        <div class="prod-main">${product.name}</div>
                        <div class="prod-sub">${product.artist}</div>
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
        renderSummary(products);
    }

    // Enviar formulario
    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const artist = document.getElementById("artist").value.trim();
        const category = document.getElementById("category").value;
        const price = parseFloat(document.getElementById("price").value);
        const stock = parseInt(document.getElementById("stock").value, 10);

        if (!name || !artist || !category || isNaN(price) || isNaN(stock)) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        products.push({
            id: nextId++,
            name,
            artist,
            category,
            price,
            stock
        });

        productForm.reset();
        renderTable();
    });

    // Limpiar formulario
    resetFormBtn.addEventListener("click", () => {
        productForm.reset();
    });

    // Scroll al formulario
    scrollToFormBtn.addEventListener("click", () => {
        productForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Búsqueda y filtro
    searchInput.addEventListener("input", renderTable);
    filterCategory.addEventListener("change", renderTable);

    // Delegación para eliminar
    productsTableBody.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete")) {
            const id = parseInt(e.target.closest(".btn-delete").dataset.id, 10);
            products = products.filter(p => p.id !== id);
            renderTable();
        }
    });

    // Primera renderización
    renderTable();
});