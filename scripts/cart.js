// Javascript for cart page

const CART_STORAGE_KEY = "cart";

const cartItemsEl = document.getElementById("cart-items");
const cartSummaryEl = document.getElementById("cart-summary");
const emptyCartButton = document.getElementById("empty-cart");
const checkoutForm = document.getElementById("checkout-form");
const formErrorsEl = document.getElementById("form-errors");
const cartSection = document.querySelector(".cart-section");
const checkoutSection = document.querySelector(".checkout-section");
const confirmationSection = document.getElementById("confirmation-section");
const confirmationMessage = document.getElementById("confirmation-message");

function getCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
        return [];
    }

    try {
        const parsedCart = JSON.parse(savedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(amount) {
    return "£" + amount.toFixed(2);
}

function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. <a href="product.html">Browse products</a> to add something.</p>';
        cartSummaryEl.textContent = "";
        return;
    }

    cartItemsEl.innerHTML = "";

    let total = 0;

    cart.forEach(function (item) {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.dataset.id = item.id;

        row.innerHTML =
            '<div class="cart-item-info">' +
                '<span class="cart-item-name">' + item.name + '</span>' +
                '<span class="cart-item-meta">' + formatPrice(item.price) + ' each &middot; subtotal ' + formatPrice(subtotal) + '</span>' +
            '</div>' +
            '<div class="cart-item-actions">' +
                '<button type="button" class="cart-item-qty-btn cart-item-decrease" aria-label="Decrease quantity">-</button>' +
                '<span class="cart-item-qty">' + item.quantity + '</span>' +
                '<button type="button" class="cart-item-qty-btn cart-item-increase" aria-label="Increase quantity">+</button>' +
                '<button type="button" class="cart-item-remove">Remove</button>' +
            '</div>';

        cartItemsEl.appendChild(row);
    });

    cartSummaryEl.textContent = "Total: " + formatPrice(total);
}

function updateQuantity(id, delta) {
    const cart = getCart();
    const item = cart.find(function (cartItem) {
        return String(cartItem.id) === String(id);
    });

    if (!item) {
        return;
    }

    item.quantity += delta;

    const updatedCart = item.quantity > 0
        ? cart
        : cart.filter(function (cartItem) {
            return String(cartItem.id) !== String(id);
        });

    saveCart(updatedCart);
    renderCart();
}

function removeItem(id) {
    const cart = getCart().filter(function (cartItem) {
        return String(cartItem.id) !== String(id);
    });

    saveCart(cart);
    renderCart();
}

function showFormErrors(errors) {
    if (errors.length === 0) {
        formErrorsEl.hidden = true;
        formErrorsEl.innerHTML = "";
        return;
    }

    formErrorsEl.hidden = false;
    formErrorsEl.innerHTML = errors.map(function (error) {
        return "<p>" + error + "</p>";
    }).join("");
}

function validateCheckoutForm(formData) {
    const errors = [];
    const requiredFields = [
        { name: "firstName", label: "First name" },
        { name: "lastName", label: "Last name" },
        { name: "email", label: "Email address" },
        { name: "street", label: "Delivery address" },
        { name: "city", label: "City" },
        { name: "postcode", label: "Postcode" },
        { name: "card", label: "Card details" }
    ];

    requiredFields.forEach(function (field) {
        if (!formData.get(field.name) || formData.get(field.name).trim() === "") {
            errors.push(field.label + " is required.");
        }
    });

    const email = formData.get("email");

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Enter a valid email address.");
    }

    return errors;
}

emptyCartButton.addEventListener("click", function () {
    saveCart([]);
    renderCart();
});

cartItemsEl.addEventListener("click", function (event) {
    const row = event.target.closest(".cart-item");

    if (!row) {
        return;
    }

    const id = row.dataset.id;

    if (event.target.classList.contains("cart-item-increase")) {
        updateQuantity(id, 1);
    } else if (event.target.classList.contains("cart-item-decrease")) {
        updateQuantity(id, -1);
    } else if (event.target.classList.contains("cart-item-remove")) {
        removeItem(id);
    }
});

checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(checkoutForm);
    const errors = validateCheckoutForm(formData);

    showFormErrors(errors);

    if (errors.length > 0) {
        return;
    }

    confirmationMessage.textContent =
        "Thanks, " + formData.get("firstName") + "! Your order has been placed and will be delivered to " + formData.get("street") + ", " + formData.get("city") + ".";

    cartSection.hidden = true;
    checkoutSection.hidden = true;
    confirmationSection.hidden = false;

    saveCart([]);
    checkoutForm.reset();
});

renderCart();
