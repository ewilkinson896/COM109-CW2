var pricing = {
    coffeeBase: 10,
    addOns: {
        Croissant: 3.2,
        Cake: 5.5,
        CinnamonBun: 3.8
    },
    giftFee: 3,
    frequencyMultiplier: {
        Weekly: 1,
        Fortnightly: 1,
        Monthly: 1
    }
};

var STORAGE_KEYS = {
    cart: "cart",
    coffeeDetails: "coffeeDetails",
    subscriptionBox: "subscriptionBox",
    subscriptionDraft: "subscriptionDraft"
};

var SUBSCRIPTION_CART_ITEM_ID = "subscription-box";
var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var messageTimerId = null;
var COFFEE_OPTIONS = ["House Blend", "Colombian Roast", "Espresso Mix"];
var ROAST_OPTIONS = ["Light", "Medium", "Dark"];
var GRIND_OPTIONS = ["Beans", "Coarse", "Fine"];

var itemImageMap = {
    coffees: {
        "House Blend": "../images/Coffee beans.webp",
        "Colombian Roast": "../images/Course Coffee.webp",
        "Espresso Mix": "../images/Fine Coffee.png"
    },
    addOns: {
        Croissant: "../images/croissant.jpg",
        Cake: "../images/chocolatecake.jpg",
        CinnamonBun: "../images/latte.jpg"
    },
    fallback: "../images/latte.jpg"
};

var $form = $("#subscriptionForm");
var $nameInput = $("#customerName");
var $emailInput = $("#customerEmail");
var $frequencyInput = $("#frequency");
var $giftInput = $("#gift");
var $addOnInputs = $(".addon");
var $message = $("#formMessage");
var $addCoffeeButton = $("#addCoffeeButton");
var $coffeeList = $("#coffeeList");
var $summaryCoffee = $("#summaryCoffee");
var $summaryAddons = $("#summaryAddons");
var $summaryFrequency = $("#summaryFrequency");
var $summaryGift = $("#summaryGift");
var $summaryPrice = $("#summaryPrice");

function readJsonFromStorage(key, fallback) {
    var value = sessionStorage.getItem(key);

    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function writeJsonToStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function getCartItems() {
    var savedCart = readJsonFromStorage(STORAGE_KEYS.cart, []);

    if (!Array.isArray(savedCart)) {
        return [];
    }

    return savedCart;
}

function saveCartItems(items) {
    writeJsonToStorage(STORAGE_KEYS.cart, items);
}

function formatPrice(amount) {
    return "£" + amount.toFixed(2);
}

function isKnownAddOn(item) {
    return Object.prototype.hasOwnProperty.call(pricing.addOns, item);
}

function normaliseCoffeeItem(item) {
    if (!item || typeof item !== "object") {
        return null;
    }

    if (typeof item.coffee !== "string" || typeof item.roast !== "string" || typeof item.grind !== "string") {
        return null;
    }

    if (item.coffee.trim() === "" || item.roast.trim() === "" || item.grind.trim() === "") {
        return null;
    }

    return {
        coffee: item.coffee,
        roast: item.roast,
        grind: item.grind
    };
}

function sanitiseDraft(rawDraft) {
    var draft;

    if (!rawDraft || typeof rawDraft !== "object") {
        return null;
    }

    draft = {
        name: typeof rawDraft.name === "string" ? rawDraft.name.trim() : "",
        email: typeof rawDraft.email === "string" ? rawDraft.email.trim() : "",
        coffeeDetails: Array.isArray(rawDraft.coffeeDetails) ? rawDraft.coffeeDetails.map(normaliseCoffeeItem).filter(Boolean) : [],
        addOns: Array.isArray(rawDraft.addOns) ? rawDraft.addOns.filter(isKnownAddOn) : [],
        frequency: pricing.frequencyMultiplier[rawDraft.frequency] !== undefined ? rawDraft.frequency : "Weekly",
        gift: Boolean(rawDraft.gift),
        updatedAt: typeof rawDraft.updatedAt === "string" ? rawDraft.updatedAt : ""
    };

    return draft;
}

function getOrCreateMessageElement() {
    if ($message.length) {
        return $message;
    }

    $message = $("<div id=\"formMessage\" role=\"alert\" aria-live=\"polite\"></div>");
    $form.after($message);

    return $message;
}

function getCoffeeDetails() {
    var savedCoffeeDetails = readJsonFromStorage(STORAGE_KEYS.coffeeDetails, null);

    if (!savedCoffeeDetails) {
        return [];
    }

    if (Array.isArray(savedCoffeeDetails)) {
        return savedCoffeeDetails;
    }

    if (savedCoffeeDetails.coffees) {
        return savedCoffeeDetails.coffees.map(function (item) {
            return {
                coffee: item,
                roast: savedCoffeeDetails.roast,
                grind: savedCoffeeDetails.grind
            };
        });
    }

    return [];
}

function getSelectedAddOns() {
    var selected = [];

    $addOnInputs.each(function () {
        if (this.checked) {
            selected.push(this.value);
        }
    });

    return selected;
}

function getCurrentSubscriptionState() {
    return {
        name: $nameInput.val().trim(),
        email: $emailInput.val().trim(),
        coffeeDetails: getCoffeeDetails(),
        addOns: getSelectedAddOns(),
        frequency: $frequencyInput.val(),
        gift: $giftInput.prop("checked")
    };
}

function calculateSubscriptionTotal(state) {
    var coffeeSubtotal = state.coffeeDetails.length * pricing.coffeeBase;
    var addOnSubtotal = 0;
    var giftSubtotal = state.gift ? pricing.giftFee : 0;

    state.addOns.forEach(function (item) {
        addOnSubtotal += pricing.addOns[item] || 0;
    });

    var subtotal = coffeeSubtotal + addOnSubtotal + giftSubtotal;
    var multiplier = pricing.frequencyMultiplier[state.frequency] || 1;
    var total = subtotal * multiplier;

    return {
        coffeeSubtotal: coffeeSubtotal,
        addOnSubtotal: addOnSubtotal,
        giftSubtotal: giftSubtotal,
        subtotal: subtotal,
        multiplier: multiplier,
        total: total
    };
}

function createSubscriptionCartItem(state, totals) {
    var addOnText = state.addOns.length ? state.addOns.join(", ") : "No add-ons";
    var descriptionParts = [state.frequency + " delivery", state.coffeeDetails.length + " coffees", addOnText];

    if (state.gift) {
        descriptionParts.push("Gift");
    }

    return {
        id: getSubscriptionCartItemId(state),
        name: "Coffee Subscription",
        description: descriptionParts.join(" | "),
        price: Number(totals.total.toFixed(2)),
        quantity: 1,
        type: "subscription"
    };
}

function getSubscriptionCartItemId(state) {
    return SUBSCRIPTION_CART_ITEM_ID + ":" + JSON.stringify({
        coffeeDetails: state.coffeeDetails,
        addOns: state.addOns,
        frequency: state.frequency,
        gift: state.gift
    });
}

function upsertSubscriptionInCart(state, totals) {
    var cart = getCartItems();
<<<<<<< HEAD
    var itemIndex = cart.findIndex(function (item) {
        return String(item.id) === SUBSCRIPTION_CART_ITEM_ID;
=======
    var cartItem = createSubscriptionCartItem(state, totals);
    var itemIndex;

    itemIndex = cart.findIndex(function (item) {
        return String(item.id) === cartItem.id;
>>>>>>> c9b6ee2 (Fixed issue where you couldn't add two subscriptions to cart)
    });

    if (itemIndex === -1) {
        cart.push(cartItem);
    } else {
        cart[itemIndex].quantity += 1;
        cart[itemIndex].price = cartItem.price;
        cart[itemIndex].description = cartItem.description;
    }

    saveCartItems(cart);
}

function saveCoffeeDetails(coffeeDetails) {
    writeJsonToStorage(STORAGE_KEYS.coffeeDetails, coffeeDetails);
}

function saveSubscriptionDraft(state) {
    writeJsonToStorage(STORAGE_KEYS.subscriptionDraft, {
        name: state.name,
        email: state.email,
        coffeeDetails: state.coffeeDetails,
        addOns: state.addOns,
        frequency: state.frequency,
        gift: state.gift,
        updatedAt: new Date().toISOString()
    });
}

function hasMeaningfulDraftData(state) {
    if (state.name !== "" || state.email !== "") {
        return true;
    }

    if (state.coffeeDetails.length > 0 || state.addOns.length > 0 || state.gift) {
        return true;
    }

    if (state.frequency !== "Weekly") {
        return true;
    }

    return false;
}

function saveDraftFromCurrentState(showFeedback) {
    var state = getCurrentSubscriptionState();

    if (!hasMeaningfulDraftData(state)) {
        clearSubscriptionDraft();
        return;
    }

    saveSubscriptionDraft(state);

    if (showFeedback) {
        showInfo("Draft saved", 1300);
    }
}

function restoreDraftIntoForm() {
    var rawDraft = readJsonFromStorage(STORAGE_KEYS.subscriptionDraft, null);
    var draft = sanitiseDraft(rawDraft);
    var restoredAddOns = {};

    if (!draft) {
        if (rawDraft) {
            clearSubscriptionDraft();
        }

        return false;
    }

    $nameInput.val(draft.name);
    $emailInput.val(draft.email);
    $frequencyInput.val(draft.frequency);
    $giftInput.prop("checked", draft.gift);

    draft.addOns.forEach(function (item) {
        restoredAddOns[item] = true;
    });

    $addOnInputs.each(function () {
        this.checked = Boolean(restoredAddOns[this.value]);
    });

    saveCoffeeDetails(draft.coffeeDetails);

    return true;
}

function clearSubscriptionDraft() {
    sessionStorage.removeItem(STORAGE_KEYS.subscriptionDraft);
}

function deleteCoffee(index) {
    var coffeeDetails = getCoffeeDetails();

    coffeeDetails.splice(index, 1);
    saveCoffeeDetails(coffeeDetails);
}

function updateCoffeeField(index, field, value) {
    var coffeeDetails = getCoffeeDetails();

    if (!coffeeDetails[index]) {
        return;
    }

    coffeeDetails[index][field] = value;
    saveCoffeeDetails(coffeeDetails);
}

function createOptionsMarkup(options, selectedValue) {
    return options.map(function (option) {
        var isSelected = option === selectedValue ? " selected" : "";
        return "<option value=\"" + escapeHtml(option) + "\"" + isSelected + ">" + escapeHtml(option) + "</option>";
    }).join("");
}

function escapeHtml(text) {
    return $("<div></div>").text(text).html();
}

function getItemImage(name, type) {
    if (type === "coffee") {
        return itemImageMap.coffees[name] || itemImageMap.fallback;
    }

    return itemImageMap.addOns[name] || itemImageMap.fallback;
}

function getCoffeeThumbClass(name) {
    if (name === "House Blend") {
        return "coffee-thumb-house";
    }

    if (name === "Colombian Roast") {
        return "coffee-thumb-colombian";
    }

    if (name === "Espresso Mix") {
        return "coffee-thumb-espresso";
    }

    return "";
}

function renderCoffeeList(coffeeDetails) {
    $coffeeList.empty();

    coffeeDetails.forEach(function (item, index) {
        var $coffeeBox = $("<div class=\"coffee-box\"></div>").attr("data-index", index);
        var $thumb = $("<img class=\"coffee-box-thumb\" alt=\"\">")
            .addClass(getCoffeeThumbClass(item.coffee))
            .attr("src", getItemImage(item.coffee, "coffee"))
            .attr("alt", item.coffee);
        var $details = $("<div class=\"coffee-box-main\"></div>");
        var $remove = $("<button type=\"button\" class=\"delete-coffee-button\">Remove</button>").attr("data-index", index);

        $details.append("<label>Coffee<select class=\"coffee-field-select\" data-index=\"" + index + "\" data-field=\"coffee\">" + createOptionsMarkup(COFFEE_OPTIONS, item.coffee) + "</select></label>");
        $details.append("<label>Roast<select class=\"coffee-field-select\" data-index=\"" + index + "\" data-field=\"roast\">" + createOptionsMarkup(ROAST_OPTIONS, item.roast) + "</select></label>");
        $details.append("<label>Grind<select class=\"coffee-field-select\" data-index=\"" + index + "\" data-field=\"grind\">" + createOptionsMarkup(GRIND_OPTIONS, item.grind) + "</select></label>");

        $coffeeBox.append($thumb, $details, $remove);

        $coffeeList.append($coffeeBox);
    });
}

function renderSummary(state, totals) {
    var coffeePreview;
    var addOnMarkup;

    if (!state.coffeeDetails.length) {
        coffeePreview = "None yet";
    } else {
        coffeePreview = state.coffeeDetails.slice(0, 2).map(function (item) {
            return item.coffee + " (" + item.roast + "/" + item.grind + ")";
        }).join(" | ");

        if (state.coffeeDetails.length > 2) {
            coffeePreview += " +" + (state.coffeeDetails.length - 2) + " more";
        }
    }

    if (!state.addOns.length) {
        addOnMarkup = "None";
    } else {
        addOnMarkup = state.addOns.map(function (item) {
            return "<span class=\"summary-addon-chip\"><img src=\"" + getItemImage(item, "addon") + "\" alt=\"" + escapeHtml(item) + "\"><span>" + escapeHtml(item) + "</span></span>";
        }).join("");
    }

    $summaryCoffee.html("<strong>Coffees:</strong> " + state.coffeeDetails.length + " selected<span class=\"summary-coffee-lines\">" + escapeHtml(coffeePreview) + "</span>");
    $summaryAddons.html("<strong>Add-ons:</strong> " + addOnMarkup);
    $summaryFrequency.html("<strong>Delivery:</strong> " + escapeHtml(state.frequency));
    $summaryGift.html("<strong>Gift:</strong> " + (state.gift ? "Yes<span class=\"summary-gift-badge\">Gift box</span>" : "No"));
    $summaryPrice.html("<strong>Price:</strong> " + formatPrice(totals.total));
}

function clearFieldErrors() {
    $nameInput.removeClass("input-error").removeAttr("aria-invalid");
    $emailInput.removeClass("input-error").removeAttr("aria-invalid");
}

function applyFieldErrors(errors) {
    errors.forEach(function (error) {
        if (error.field === "name") {
            $nameInput.addClass("input-error").attr("aria-invalid", "true");
        }

        if (error.field === "email") {
            $emailInput.addClass("input-error").attr("aria-invalid", "true");
        }
    });
}

function showMessage(typeClass, messageText, ttl) {
    var $feedback = getOrCreateMessageElement();

    if (messageTimerId) {
        clearTimeout(messageTimerId);
        messageTimerId = null;
    }

    if (!messageText) {
        $feedback.removeClass("form-error form-success form-info is-visible").text("");
        return;
    }

    $feedback.removeClass("form-error form-success form-info").addClass(typeClass).text(messageText).addClass("is-visible");

    if (ttl) {
        messageTimerId = setTimeout(function () {
            $feedback.removeClass("is-visible");
            messageTimerId = null;
        }, ttl);
    }
}

function renderErrors(errors) {
    var $feedback = getOrCreateMessageElement();
    var markup;

    if (!errors.length) {
        showMessage("", "");
        return;
    }

    markup = errors.map(function (error) {
        return "<p>" + escapeHtml(error.message) + "</p>";
    }).join("");

    if (messageTimerId) {
        clearTimeout(messageTimerId);
        messageTimerId = null;
    }

    $feedback.removeClass("form-success form-info").addClass("form-error is-visible").html(markup);
}

function showSuccess(messageText) {
    showMessage("form-success", messageText, 2200);
}

function showInfo(messageText, ttl) {
    showMessage("form-info", messageText, ttl || 1500);
}

function focusFirstInvalidField(errors) {
    if (!errors.length) {
        return;
    }

    if (errors[0].field === "name") {
        $nameInput.trigger("focus");
        return;
    }

    if (errors[0].field === "email") {
        $emailInput.trigger("focus");
        return;
    }

    if (errors[0].field === "coffee") {
        $addCoffeeButton.trigger("focus");
    }
}

function updateSummary() {
    var state = getCurrentSubscriptionState();
    var totals = calculateSubscriptionTotal(state);

    renderCoffeeList(state.coffeeDetails);
    renderSummary(state, totals);
}

function validateForm() {
    var state = getCurrentSubscriptionState();
    var errors = [];
    var missingCoffeeDetails;

    if (state.name === "") {
        errors.push({
            field: "name",
            message: "Enter your name"
        });
    } else if (state.name.length < 2) {
        errors.push({
            field: "name",
            message: "Name must be at least 2 characters"
        });
    }

    if (state.email === "") {
        errors.push({
            field: "email",
            message: "Enter your email"
        });
    } else if (!emailPattern.test(state.email)) {
        errors.push({
            field: "email",
            message: "Enter a valid email"
        });
    }

    if (state.coffeeDetails.length === 0) {
        errors.push({
            field: "coffee",
            message: "Choose at least one coffee"
        });
    }

    missingCoffeeDetails = state.coffeeDetails.some(function (item) {
        return !item || !item.coffee || !item.roast || !item.grind;
    });

    if (missingCoffeeDetails) {
        errors.push({
            field: "coffee",
            message: "Each coffee item needs a coffee, roast and grind"
        });
    }

    return errors;
}

function updateValidationStateWhileEditing() {
    var errors = validateForm();

    clearFieldErrors();

    if (errors.length) {
        applyFieldErrors(errors);
    }

    if (!errors.length && $message.hasClass("form-error")) {
        showMessage("", "");
    }
}

function setupSubscriptionCarousel() {
    var $carousel = $(".subscription-carousel");
    var $slides = $carousel.find(".carousel-slide");
    var $dots = $carousel.find(".carousel-dot");
    var slideCount = $slides.length;
    var activeSlide = 0;

    function showSlide(index) {
        var safeIndex;

        if (!slideCount) {
            return;
        }

        safeIndex = ((index % slideCount) + slideCount) % slideCount;
        activeSlide = safeIndex;

        $slides.removeClass("is-active").eq(safeIndex).addClass("is-active");
        $dots.removeClass("is-active").eq(safeIndex).addClass("is-active");
    }

    function moveSlide(step) {
        showSlide(activeSlide + step);
    }

    if (!$carousel.length || slideCount <= 1) {
        return;
    }

    $carousel.on("click", ".carousel-button-prev", function () {
        moveSlide(-1);
    });

    $carousel.on("click", ".carousel-button-next", function () {
        moveSlide(1);
    });

    $carousel.on("click", ".carousel-dot", function () {
        var selected = Number($(this).attr("data-slide"));

        if (Number.isNaN(selected)) {
            return;
        }

        showSlide(selected);
    });

    showSlide(0);
}

$form.on("input change", function (event) {
    if ($(event.target).hasClass("coffee-field-select")) {
        return;
    }

    updateSummary();
    saveDraftFromCurrentState(false);
    updateValidationStateWhileEditing();
});

$(window).on("pageshow", function () {
    updateSummary();
    saveDraftFromCurrentState(false);
});

$addCoffeeButton.on("click", function () {
    var coffeeDetails = getCoffeeDetails();

    coffeeDetails.push({
        coffee: COFFEE_OPTIONS[0],
        roast: ROAST_OPTIONS[1],
        grind: GRIND_OPTIONS[0]
    });

    saveCoffeeDetails(coffeeDetails);
    updateSummary();
    saveDraftFromCurrentState(false);
});

$coffeeList.on("change", ".coffee-field-select", function () {
    var index = Number($(this).attr("data-index"));
    var field = $(this).attr("data-field");
    var value = $(this).val();

    if (Number.isNaN(index) || !field) {
        return;
    }

    updateCoffeeField(index, field, value);
    updateSummary();
    saveDraftFromCurrentState(false);
});

$coffeeList.on("click", ".delete-coffee-button", function () {
    var index = Number($(this).attr("data-index"));

    deleteCoffee(index);
    updateSummary();
    saveDraftFromCurrentState(false);
});

$form.on("submit", function (event) {
    var errors = validateForm();
    var state = getCurrentSubscriptionState();
    var totals = calculateSubscriptionTotal(state);

    event.preventDefault();
    clearFieldErrors();

    if (errors.length) {
        renderErrors(errors);
        applyFieldErrors(errors);
        focusFirstInvalidField(errors);
        return;
    }

    writeJsonToStorage(STORAGE_KEYS.subscriptionBox, state);
    upsertSubscriptionInCart(state, totals);
    clearSubscriptionDraft();
    showSuccess("Saved to cart");
});

if (restoreDraftIntoForm()) {
    showInfo("Draft restored from your last visit.", 1700);
}

setupSubscriptionCarousel();
updateSummary();