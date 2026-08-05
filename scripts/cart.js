$(function () {
    "use strict";

    const CART_STORAGE_KEY = "cart";
    const cartItemsEl = $("#cart-items");
    const cartSummaryEl = $("#cart-summary");
    const emptyCartButton = $("#empty-cart");
    const checkoutForm = $("#checkout-form");
    const formErrorsEl = $("#form-errors");
    const cartSection = $(".cart-section");
    const checkoutSection = $(".checkout-section");
    const confirmationSection = $("#confirmation-section");
    const confirmationMessage = $("#confirmation-message");

    function getCart() {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    function formatPrice(amount) {
        return `£${amount.toFixed(2)}`;
    }

    function showFormErrors(errors) {
        if (!errors.length) {
            formErrorsEl.prop("hidden", true).empty();
            return;
        }

        formErrorsEl.prop("hidden", false).html(errors.map((error) => `<p>${error}</p>`).join(""));
    }

    function renderCart() {
        const cart = getCart();

        if (!cart.length) {
            cartItemsEl.html('<p class="cart-empty">Your cart is empty. <a href="product.html">Browse products</a> to add something.</p>');
            cartSummaryEl.text("");
            return;
        }

        cartItemsEl.empty();
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        cartItemsEl.append(
            cart.map((item) => {
                const subtotal = item.price * item.quantity;
                const description = item.description ? `<span class="cart-item-description">${item.description}</span>` : "";

                return $("<div>")
                    .addClass("cart-item")
                    .attr("data-id", item.id)
                    .html(
                        `<div class="cart-item-info">` +
                            `<span class="cart-item-name">${item.name}</span>` +
                            description +
                            `<span class="cart-item-meta">${formatPrice(item.price)} each &middot; subtotal ${formatPrice(subtotal)}</span>` +
                        `</div>` +
                        `<div class="cart-item-actions">` +
                            `<button type="button" class="cart-item-qty-btn cart-item-decrease" aria-label="Decrease quantity">-</button>` +
                            `<span class="cart-item-qty">${item.quantity}</span>` +
                            `<button type="button" class="cart-item-qty-btn cart-item-increase" aria-label="Increase quantity">+</button>` +
                            `<button type="button" class="cart-item-remove">Remove</button>` +
                        `</div>`
                    );
            })
        );

        cartSummaryEl.html(`
            <div class="summary-card">
                <p><span>Subtotal</span><strong>${formatPrice(total)}</strong></p>
                <p><span>Delivery</span><strong>Free</strong></p>
                <p class="summary-total"><span>Total</span><strong>${formatPrice(total)}</strong></p>
            </div>
        `);
    }

    function updateQuantity(id, delta) {
        const cart = getCart();
        const item = cart.find((cartItem) => String(cartItem.id) === String(id));

        if (!item) {
            return;
        }

        item.quantity += delta;
        const updatedCart = item.quantity > 0
            ? cart
            : cart.filter((cartItem) => String(cartItem.id) !== String(id));

        saveCart(updatedCart);
        renderCart();
    }

    function removeItem(id) {
        saveCart(getCart().filter((cartItem) => String(cartItem.id) !== String(id)));
        renderCart();
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
            { name: "cardNumber", label: "Card number" },
            { name: "expiry", label: "Expiry date" },
            { name: "cvv", label: "CVV" }
        ];

        $.each(requiredFields, (_, field) => {
            const value = formData.get(field.name);
            if (!value || value.trim() === "") {
                errors.push(`${field.label} is required.`);
            }
        });

        const email = formData.get("email");
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("Enter a valid email address.");
        }

        const firstName = formData.get("firstName");
        if (firstName && /\d/.test(firstName)) {
            errors.push("First name must not contain numbers.");
        }

        const lastName = formData.get("lastName");
        if (lastName && /\d/.test(lastName)) {
            errors.push("Last name must not contain numbers.");
        }

        const cardNumber = formData.get("cardNumber").replace(/\s+/g, "");
        if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
            errors.push("Card number must be 16 digits.");
        }

        const expiry = formData.get("expiry");
        if (expiry && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
            errors.push("Expiry date must use MM/YY format.");
        } else if (expiry) {
            const [month, year] = expiry.split("/").map((value) => Number(value));
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;

            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                errors.push("Card expiry date must be in the future.");
            }
        }

        const cvv = formData.get("cvv");
        if (cvv && !/^\d{3}$/.test(cvv)) {
            errors.push("CVV must be 3 digits.");
        }

        return errors;
    }

    emptyCartButton.on("click", () => {
        saveCart([]);
        renderCart();
    });

    cartItemsEl.on("click", (event) => {
        const row = $(event.target).closest(".cart-item");
        if (!row.length) {
            return;
        }

        const id = row.attr("data-id");
        const target = $(event.target);

        if (target.hasClass("cart-item-increase")) {
            updateQuantity(id, 1);
        } else if (target.hasClass("cart-item-decrease")) {
            updateQuantity(id, -1);
        } else if (target.hasClass("cart-item-remove")) {
            removeItem(id);
        }
    });

    checkoutForm.on("submit", (event) => {
        event.preventDefault();

        const cart = getCart();
        if (!cart.length) {
            showFormErrors(["Your cart is empty. Add an item before checking out."]);
            return;
        }

        const formElement = checkoutForm.get(0);
        const formData = new FormData(formElement);
        const errors = validateCheckoutForm(formData);

        showFormErrors(errors);
        if (errors.length) {
            return;
        }

        confirmationMessage.text(`Thanks, ${formData.get("firstName")}! Your order has been placed and will be delivered to ${formData.get("street")}, ${formData.get("city")}.`);

        cartSection.hide();
        checkoutSection.hide();
        confirmationSection.show();

        saveCart([]);
        formElement.reset();
    });

    renderCart();
});
