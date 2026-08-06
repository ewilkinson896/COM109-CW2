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
        image: "../images/cinnamon-bun.jpeg"
    }
];

const CART_STORAGE_KEY = "cart";

let activeFilter = "all";
let searchTerm = "";

const productGrid = $("#productGrid");
const noResultsMessage = $("#noResultsMessage");
const filterButtons = $(".filter-button");
const searchInput = $("#productSearch");

const productModal = $("#productModal");
const modalCloseButton = productModal.find(".modal-close");
const modalDescription = $("#modalProductDescription");
const modalBox = productModal.find(".modal-box");
let lastFocusedElement = null;

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
        '<button type="button" class="view-details-btn" aria-label="View details for ' + product.name + '">View details</button>' +
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

    productGrid.empty();
    visibleProducts.forEach(function (product) {
        productGrid.append(createProductCard(product));
    });

    noResultsMessage.prop("hidden", visibleProducts.length > 0);
}

function getModalFocusableElements() {
    return modalBox.find('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])').filter(':visible');
}

function trapModalFocus(event) {
    const focusableElements = getModalFocusableElements();

    if (!focusableElements.length) {
        event.preventDefault();
        modalBox.trigger("focus");
        return;
    }

    const firstElement = focusableElements.get(0);
    const lastElement = focusableElements.get(focusableElements.length - 1);
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

function openProductModal(product, triggerElement) {
    const detailsList = (product.details && product.details.length)
        ? '<ul class="modal-details">' +
            product.details.map(function (detail) {
                return '<li>' + detail + '</li>';
            }).join('') +
          '</ul>'
        : '';

    lastFocusedElement = triggerElement || document.activeElement;
    modalDescription.html('<h2 id="modalProductTitle">' + product.name + '</h2><p id="modalProductText">' + product.description + '</p>' + detailsList);

    productModal.prop("hidden", false);
    modalCloseButton.trigger("focus");
}

function closeProductModal() {
    productModal.prop("hidden", true);

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
    }
}

function setActiveFilter(filter) {
    activeFilter = filter;

    filterButtons.each(function () {
        $(this).toggleClass("active", $(this).data("filter") === filter);
    });

    renderProducts();
}

filterButtons.on("click", function () {
    setActiveFilter($(this).data("filter"));
});

searchInput.on("input", function () {
    searchTerm = $(this).val().trim().toLowerCase();
    renderProducts();
});

productGrid.on("click", function (event) {
    const card = $(event.target).closest(".product-card");

    if (!card.length) {
        return;
    }

    const productId = Number(card.attr("data-id"));
    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        return;
    }

    const addButton = $(event.target).closest(".add-to-cart-btn");

    if (addButton.length) {
        addToCart(product);

        addButton.text("✓").prop("disabled", true);

        setTimeout(function () {
            addButton.text("+").prop("disabled", false);
        }, 900);

        return;
    }

    const detailsButton = card.find(".view-details-btn").get(0);
    const triggerElement = $(event.target).closest(".view-details-btn").get(0) || detailsButton;

    openProductModal(product, triggerElement);
});

modalCloseButton.on("click", closeProductModal);

productModal.on("click", function (event) {
    if (event.target === productModal.get(0)) {
        closeProductModal();
    }
});

$(document).on("keydown", function (event) {
    if (productModal.prop("hidden")) {
        return;
    }

    if (event.key === "Escape") {
        closeProductModal();
        return;
    }

    if (event.key === "Tab") {
        trapModalFocus(event);
    }
});

renderProducts();
