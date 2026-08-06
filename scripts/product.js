// Javascript for product page

const products = [
    {
        id: 1,
        name: "House Blend Coffee",
        category: "coffee",
        price: 8.50,
        description: "Our House Blend brings together beans from three continents for a smooth, balanced everyday cup. It's the coffee we recommend to first-time visitors and the one most regulars order without thinking twice.",
        details: [
            "Origin: Blend of Brazil, Colombia and Ethiopia",
            "Roast: Medium",
            "Tasting notes: Milk chocolate, toasted nuts, soft citrus",
            "Best for: Filter, cafetière, everyday drinking"
        ],
        image: "../images/latte.jpg"
    },
    {
        id: 2,
        name: "Colombian Roast",
        category: "coffee",
        price: 9.20,
        description: "A bright, fruit-forward single-origin coffee grown in the mountains of Huila, Colombia. Washed and sun-dried on-farm, it keeps a clean, juicy sweetness that holds up well whether you take it black or with milk.",
        details: [
            "Origin: Huila, Colombia",
            "Altitude: 1,700-1,900m",
            "Process: Washed",
            "Tasting notes: Red apple, caramel, brown sugar"
        ],
        image: "../images/latte.jpg"
    },
    {
        id: 3,
        name: "Espresso Blend",
        category: "coffee",
        price: 9.80,
        description: "Roasted specifically for espresso, this blend is dark and syrupy with enough body to cut through milk without losing its character. It's the base for every latte and flat white behind our counter.",
        details: [
            "Origin: Blend of Brazil and Vietnam Robusta",
            "Roast: Dark",
            "Tasting notes: Dark chocolate, roasted almond, molasses",
            "Best for: Espresso, milk-based drinks"
        ],
        image: "../images/latte.jpg"
    },
    {
        id: 4,
        name: "Butter Croissant",
        category: "bakery",
        price: 3.20,
        description: "Made fresh in-house every morning using a traditional French laminated dough, layered dozens of times with butter for a crisp, flaky shell and a soft, honeycombed centre.",
        details: [
            "Baked: Fresh every morning, from scratch",
            "Ingredients: Wheat flour, butter, yeast, milk, salt",
            "Contains: Gluten, dairy",
            "Best paired with: Espresso or filter coffee"
        ],
        image: "../images/croissant.jpg"
    },
    {
        id: 5,
        name: "Chocolate Cake Slice",
        category: "bakery",
        price: 4.50,
        description: "A dense, moist chocolate sponge made with real cocoa, filled and topped with a smooth dark chocolate ganache. It's the cake most customers ask for by name.",
        details: [
            "Ingredients: Cocoa, dark chocolate, eggs, butter, flour",
            "Contains: Gluten, dairy, eggs",
            "Serving: Cut fresh in-store daily"
        ],
        image: "../images/chocolatecake.jpg"
    },
    {
        id: 6,
        name: "Cinnamon Bun",
        category: "bakery",
        price: 3.80,
        description: "A soft, pillowy bun rolled with cinnamon sugar butter, proved slowly overnight for extra flavour, then finished with a light cream cheese glaze once baked.",
        details: [
            "Ingredients: Wheat flour, cinnamon, butter, sugar, cream cheese glaze",
            "Contains: Gluten, dairy",
            "Best served: Warm, straight from the oven"
        ],
        image: "../images/croissant.jpg"
    }
];

const CART_STORAGE_KEY = "cart";

let activeFilter = "all";
let searchTerm = "";

const productGrid = document.getElementById("productGrid");
const noResultsMessage = document.getElementById("noResultsMessage");
const filterButtons = document.querySelectorAll(".filter-button");
const searchInput = document.getElementById("productSearch");

const productModal = document.getElementById("productModal");
const modalCloseButton = productModal.querySelector(".modal-close");
const modalDescription = document.getElementById("modalProductDescription");

function getVisibleProducts() {
    return products.filter(function (product) {
        const matchesFilter = activeFilter === "all" || product.category === activeFilter;
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

        return matchesFilter && matchesSearch;
    });
}

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = product.id;

    card.innerHTML =
        '<img class="product-image" src="' + product.image + '" alt="' + product.name + '">' +
        '<div class="product-card-body">' +
            '<h3 class="product-name">' + product.name + '</h3>' +
            '<p class="product-price">£' + product.price.toFixed(2) + '</p>' +
        '</div>' +
        '<button type="button" class="add-to-cart-btn" aria-label="Add ' + product.name + ' to cart">+</button>';

    return card;
}

function getCart() {
    try {
        const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(function (item) {
        return String(item.id) === String(product.id);
    });

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart(cart);
}

function renderProducts() {
    const visibleProducts = getVisibleProducts();

    productGrid.innerHTML = "";
    visibleProducts.forEach(function (product) {
        productGrid.appendChild(createProductCard(product));
    });

    noResultsMessage.hidden = visibleProducts.length > 0;
}

function openProductModal(product) {
    const detailsList = (product.details && product.details.length)
        ? '<ul class="modal-details">' +
            product.details.map(function (detail) {
                return '<li>' + detail + '</li>';
            }).join('') +
          '</ul>'
        : '';

    modalDescription.innerHTML = '<p>' + product.description + '</p>' + detailsList;

    productModal.hidden = false;
}

function closeProductModal() {
    productModal.hidden = true;
}

function setActiveFilter(filter) {
    activeFilter = filter;

    filterButtons.forEach(function (button) {
        button.classList.toggle("active", button.dataset.filter === filter);
    });

    renderProducts();
}

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        setActiveFilter(button.dataset.filter);
    });
});

searchInput.addEventListener("input", function (event) {
    searchTerm = event.target.value.trim().toLowerCase();
    renderProducts();
});

productGrid.addEventListener("click", function (event) {
    const card = event.target.closest(".product-card");

    if (!card) {
        return;
    }

    const productId = Number(card.dataset.id);
    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        return;
    }

    const addButton = event.target.closest(".add-to-cart-btn");

    if (addButton) {
        addToCart(product);

        addButton.textContent = "✓";
        addButton.disabled = true;

        setTimeout(function () {
            addButton.textContent = "+";
            addButton.disabled = false;
        }, 900);

        return;
    }

    openProductModal(product);
});

modalCloseButton.addEventListener("click", closeProductModal);

productModal.addEventListener("click", function (event) {
    if (event.target === productModal) {
        closeProductModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !productModal.hidden) {
        closeProductModal();
    }
});

renderProducts();
