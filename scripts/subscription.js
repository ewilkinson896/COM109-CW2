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

function formatPrice(amount) {
    return "£" + amount.toFixed(2);
}

function getCoffeeDetails() {
    var savedCoffeeDetails = localStorage.getItem("coffeeDetails");

    if (!savedCoffeeDetails) {
        return [];
    }

    try {
        savedCoffeeDetails = JSON.parse(savedCoffeeDetails);
    } catch (error) {
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
    localStorage.setItem("coffeeDetails", JSON.stringify(coffeeDetails));
}

function deleteCoffee(index) {
    var coffeeDetails = getCoffeeDetails();

    coffeeDetails.splice(index, 1);
    saveCoffeeDetails(coffeeDetails);
    updateSummary();
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

function updateSummary() {
    var state = getCurrentSubscriptionState();
    var totals = calculateSubscriptionTotal(state);

    renderCoffeeList(state.coffeeDetails);
    renderSummary(state, totals);
}

function validateForm() {
    var state = getCurrentSubscriptionState();

    if (state.name === "") {
        return "Enter your name";
    }

    if (state.email === "") {
        return "Enter your email";
    }

    if (state.coffeeDetails.length === 0) {
        return "Choose at least one coffee";
    }

    return "";
}

form.addEventListener("input", updateSummary);
window.addEventListener("pageshow", updateSummary);
addCoffeeButton.addEventListener("click", function () {
    window.location.href = "coffee-details.html";
});
coffeeList.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-coffee-button")) {
        deleteCoffee(Number(event.target.dataset.index));
    }
});

form.addEventListener("submit", function (event) {
    var error = validateForm();
    var state = getCurrentSubscriptionState();

    event.preventDefault();

    if (error !== "") {
        if (message) {
            message.textContent = error;
        }
        return;
    }

    localStorage.setItem("subscriptionBox", JSON.stringify(state));
    if (message) {
        message.textContent = "Subscription saved";
    }
});

updateSummary();