var pricing = {
    coffeeBase: 10,
    addOns: {
        Croissant: 2,
        Brownie: 2.5,
        Cookie: 1.5
    },
    giftFee: 3,
    frequencyMultiplier: {
        Weekly: 1,
        Fortnightly: 1,
        Monthly: 1
    }
};

var STORAGE_KEYS = {
    coffeeDetails: "coffeeDetails",
    subscriptionBox: "subscriptionBox",
    subscriptionDraft: "subscriptionDraft"
};

var form = document.getElementById("subscriptionForm");
var nameInput = document.getElementById("customerName");
var emailInput = document.getElementById("customerEmail");
var frequencyInput = document.getElementById("frequency");
var giftInput = document.getElementById("gift");
var addOnInputs = document.querySelectorAll(".addon");
var message = document.getElementById("formMessage");
var addCoffeeButton = document.getElementById("addCoffeeButton");
var coffeeList = document.getElementById("coffeeList");
var summaryCoffee = document.getElementById("summaryCoffee");
var summaryAddons = document.getElementById("summaryAddons");
var summaryFrequency = document.getElementById("summaryFrequency");
var summaryGift = document.getElementById("summaryGift");
var summaryPrice = document.getElementById("summaryPrice");
var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readJsonFromStorage(key, fallback) {
    var value = localStorage.getItem(key);

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
    localStorage.setItem(key, JSON.stringify(value));
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

function getLegacyCoffeeDetails(rawDraft) {
    if (!rawDraft || typeof rawDraft !== "object") {
        return [];
    }

    if (!Array.isArray(rawDraft.coffees)) {
        return [];
    }

    return rawDraft.coffees.map(function (coffeeName) {
        return normaliseCoffeeItem({
            coffee: coffeeName,
            roast: rawDraft.roast,
            grind: rawDraft.grind
        });
    }).filter(Boolean);
}

function sanitiseDraft(rawDraft) {
    var draft;
    var rawCoffeeDetails;

    if (!rawDraft || typeof rawDraft !== "object") {
        return null;
    }

    rawCoffeeDetails = Array.isArray(rawDraft.coffeeDetails)
        ? rawDraft.coffeeDetails
        : getLegacyCoffeeDetails(rawDraft);

    draft = {
        name: typeof rawDraft.name === "string" ? rawDraft.name.trim() : "",
        email: typeof rawDraft.email === "string" ? rawDraft.email.trim() : "",
        coffeeDetails: rawCoffeeDetails.map(normaliseCoffeeItem).filter(Boolean),
        addOns: Array.isArray(rawDraft.addOns) ? rawDraft.addOns.filter(isKnownAddOn) : [],
        frequency: pricing.frequencyMultiplier[rawDraft.frequency] !== undefined ? rawDraft.frequency : "Weekly",
        gift: Boolean(rawDraft.gift),
        updatedAt: typeof rawDraft.updatedAt === "string" ? rawDraft.updatedAt : ""
    };

    return draft;
}

function getOrCreateMessageElement() {
    if (message) {
        return message;
    }

    message = document.createElement("div");
    message.id = "formMessage";
    message.setAttribute("role", "alert");
    message.setAttribute("aria-live", "polite");

    if (form && form.parentNode) {
        form.parentNode.insertBefore(message, form.nextSibling);
    }

    return message;
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

    addOnInputs.forEach(function (item) {
        if (item.checked) {
            selected.push(item.value);
        }
    });

    return selected;
}

function getCurrentSubscriptionState() {
    return {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        coffeeDetails: getCoffeeDetails(),
        addOns: getSelectedAddOns(),
        frequency: frequencyInput.value,
        gift: giftInput.checked
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

function saveDraftFromCurrentState() {
    saveSubscriptionDraft(getCurrentSubscriptionState());
}

function restoreDraftIntoForm() {
    var rawDraft = readJsonFromStorage(STORAGE_KEYS.subscriptionDraft, null);
    var draft = sanitiseDraft(rawDraft);
    var restoredAddOns;

    if (!draft) {
        return false;
    }

    nameInput.value = draft.name;
    emailInput.value = draft.email;
    frequencyInput.value = draft.frequency;
    giftInput.checked = draft.gift;

    restoredAddOns = {};
    draft.addOns.forEach(function (item) {
        restoredAddOns[item] = true;
    });

    addOnInputs.forEach(function (item) {
        item.checked = Boolean(restoredAddOns[item.value]);
    });

    saveCoffeeDetails(draft.coffeeDetails);

    return true;
}

function clearSubscriptionDraft() {
    localStorage.removeItem(STORAGE_KEYS.subscriptionDraft);
}

function deleteCoffee(index) {
    var coffeeDetails = getCoffeeDetails();

    coffeeDetails.splice(index, 1);
    saveCoffeeDetails(coffeeDetails);
    updateSummary();
    saveDraftFromCurrentState();
}

function renderCoffeeList(coffeeDetails) {
    coffeeList.innerHTML = "";

    coffeeDetails.forEach(function (item, index) {
        var coffeeBox = document.createElement("div");
        coffeeBox.className = "coffee-box";
        coffeeBox.innerHTML = "<p>Coffee " + (index + 1) + ": " + item.coffee + "</p><p>Roast: " + item.roast + "</p><p>Grind: " + item.grind + "</p><button type=\"button\" class=\"delete-coffee-button\" data-index=\"" + index + "\">Delete</button>";
        coffeeList.appendChild(coffeeBox);
    });
}

function renderSummary(state, totals) {
    summaryCoffee.textContent = "Coffees: " + state.coffeeDetails.length + " selected";
    summaryAddons.textContent = "Add-ons: " + (state.addOns.join(", ") || "None");
    summaryFrequency.textContent = "Delivery: " + state.frequency;
    summaryGift.textContent = "Gift: " + (state.gift ? "Yes" : "No");
    summaryPrice.textContent = "Price: " + formatPrice(totals.total);
}

function clearFieldErrors() {
    nameInput.classList.remove("input-error");
    emailInput.classList.remove("input-error");
    nameInput.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-invalid");
}

function applyFieldErrors(errors) {
    errors.forEach(function (error) {
        if (error.field === "name") {
            nameInput.classList.add("input-error");
            nameInput.setAttribute("aria-invalid", "true");
        }

        if (error.field === "email") {
            emailInput.classList.add("input-error");
            emailInput.setAttribute("aria-invalid", "true");
        }
    });
}

function renderErrors(errors) {
    var feedback = getOrCreateMessageElement();

    feedback.className = "form-error";

    if (!errors.length) {
        feedback.textContent = "";
        return;
    }

    feedback.innerHTML = errors.map(function (error) {
        return "<p>" + error.message + "</p>";
    }).join("");
}

function showSuccess(messageText) {
    var feedback = getOrCreateMessageElement();

    feedback.className = "form-success";
    feedback.textContent = messageText;
}

function showInfo(messageText) {
    var feedback = getOrCreateMessageElement();

    feedback.className = "form-info";
    feedback.textContent = messageText;
}

function focusFirstInvalidField(errors) {
    if (!errors.length) {
        return;
    }

    if (errors[0].field === "name") {
        nameInput.focus();
        return;
    }

    if (errors[0].field === "email") {
        emailInput.focus();
        return;
    }

    if (errors[0].field === "coffee") {
        addCoffeeButton.focus();
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

form.addEventListener("input", function () {
    var errors;

    updateSummary();
    saveDraftFromCurrentState();

    clearFieldErrors();
    errors = validateForm();

    if (errors.length) {
        applyFieldErrors(errors);
    } else if (message) {
        message.textContent = "";
        message.className = "";
    }
});
window.addEventListener("pageshow", function () {
    updateSummary();
    saveDraftFromCurrentState();
});
addCoffeeButton.addEventListener("click", function () {
    saveDraftFromCurrentState();
    window.location.href = "coffee-details.html";
});
coffeeList.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-coffee-button")) {
        deleteCoffee(Number(event.target.dataset.index));
    }
});

form.addEventListener("submit", function (event) {
    var errors = validateForm();
    var state = getCurrentSubscriptionState();

    event.preventDefault();
    clearFieldErrors();

    if (errors.length) {
        renderErrors(errors);
        applyFieldErrors(errors);
        focusFirstInvalidField(errors);
        return;
    }

    writeJsonToStorage(STORAGE_KEYS.subscriptionBox, state);
    clearSubscriptionDraft();
    showSuccess("Subscription saved");
});

if (restoreDraftIntoForm()) {
    showInfo("Draft restored from your last visit.");
}

updateSummary();
