$(function () {
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
            cartItemsEl.html('<p class="cart-empty">Your cart is empty. <a href="product.html">Browse products</a> to add something.</p>');
            cartSummaryEl.text("");
            return;
        }

        cartItemsEl.empty();

        let total = 0;

        $.each(cart, function (_, item) {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const row = $("<div>")
                .addClass("cart-item")
                .attr("data-id", item.id)
                .html(
                    '<div class="cart-item-info">' +
                        '<span class="cart-item-name">' + item.name + '</span>' +
                        '<span class="cart-item-meta">' + formatPrice(item.price) + ' each &middot; subtotal ' + formatPrice(subtotal) + '</span>' +
                    '</div>' +
                    '<div class="cart-item-actions">' +
                        '<button type="button" class="cart-item-qty-btn cart-item-decrease" aria-label="Decrease quantity">-</button>' +
                        '<span class="cart-item-qty">' + item.quantity + '</span>' +
                        '<button type="button" class="cart-item-qty-btn cart-item-increase" aria-label="Increase quantity">+</button>' +
                        '<button type="button" class="cart-item-remove">Remove</button>' +
                    '</div>'
                );

            cartItemsEl.append(row);
        });

        cartSummaryEl.text("Total: " + formatPrice(total));
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
            formErrorsEl.prop("hidden", true).empty();
            return;
        }

        formErrorsEl.prop("hidden", false).html(errors.map(function (error) {
            return "<p>" + error + "</p>";
        }).join(""));
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

        $.each(requiredFields, function (_, field) {
            const value = formData.get(field.name);
            if (!value || value.trim() === "") {
                errors.push(field.label + " is required.");
            }
        });

        const email = formData.get("email");

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("Enter a valid email address.");
        }

        return errors;
    }

    emptyCartButton.on("click", function () {
        saveCart([]);
        renderCart();
    });

    cartItemsEl.on("click", function (event) {
        const row = $(event.target).closest(".cart-item");

        if (!row.length) {
            return;
        }

        const id = row.attr("data-id");

        if ($(event.target).hasClass("cart-item-increase")) {
            updateQuantity(id, 1);
        } else if ($(event.target).hasClass("cart-item-decrease")) {
            updateQuantity(id, -1);
        } else if ($(event.target).hasClass("cart-item-remove")) {
            removeItem(id);
        }
    });

    checkoutForm.on("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(checkoutForm[0]);
        const errors = validateCheckoutForm(formData);

        showFormErrors(errors);

        if (errors.length > 0) {
            return;
        }

        confirmationMessage.text("Thanks, " + formData.get("firstName") + "! Your order has been placed and will be delivered to " + formData.get("street") + ", " + formData.get("city") + ".");

        cartSection.hide();
        checkoutSection.hide();
        confirmationSection.show();

        saveCart([]);
        checkoutForm[0].reset();
    });

    renderCart();
});
