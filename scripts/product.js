// Javascript for product page

const products = [
    {
        id: 1,
        name: "House Blend Coffee",
        category: "coffee",
        price: 8.50,
        description: "Smooth, balanced beans roasted for everyday drinking.",
        image: "../images/latte.jpg"
    },
    {
        id: 2,
        name: "Colombian Roast",
        category: "coffee",
        price: 9.20,
        description: "Bright, fruity single-origin beans from Colombia.",
        image: "../images/latte.jpg"
    },
    {
        id: 3,
        name: "Espresso Blend",
        category: "coffee",
        price: 9.80,
        description: "Dark, bold beans made for rich espresso shots.",
        image: "../images/latte.jpg"
    },
    {
        id: 4,
        name: "Butter Croissant",
        category: "bakery",
        price: 3.20,
        description: "Flaky, buttery pastry baked fresh every morning.",
        image: "../images/croissant.jpg"
    },
    {
        id: 5,
        name: "Chocolate Cake Slice",
        category: "bakery",
        price: 4.50,
        description: "Rich chocolate sponge with smooth ganache icing.",
        image: "../images/chocolatecake.jpg"
    },
    {
        id: 6,
        name: "Cinnamon Bun",
        category: "bakery",
        price: 3.80,
        description: "Soft, spiced bun swirled with cinnamon sugar.",
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
            '<p class="product-description">' + product.description + '</p>' +
        '</div>' +
        '<button type="button" class="add-to-cart-btn" aria-label="Add ' + product.name + ' to cart">+</button>';

    return card;
}

function getCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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
    const button = event.target.closest(".add-to-cart-btn");

    if (!button) {
        return;
    }

    const card = button.closest(".product-card");
    const productId = Number(card.dataset.id);
    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        return;
    }

    addToCart(product);

    button.textContent = "✓";
    button.disabled = true;

    setTimeout(function () {
        button.textContent = "+";
        button.disabled = false;
    }, 900);
});

renderProducts();
