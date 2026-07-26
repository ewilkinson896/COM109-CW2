var prices = {
    coffee: 10,
    addOns: {
        Croissant: 2,
        Brownie: 2.5,
        Cookie: 1.5
    },
    gift: 3
};

var form = document.getElementById("subscriptionForm");
var nameInput = document.getElementById("customerName");
var emailInput = document.getElementById("customerEmail");
var coffeeInput = document.getElementById("coffee");
var roastInput = document.getElementById("roast");
var grindInput = document.getElementById("grind");
var frequencyInput = document.getElementById("frequency");
var giftInput = document.getElementById("gift");
var addOnInputs = document.querySelectorAll(".addon");
var message = document.getElementById("formMessage");

function getSelectedAddOns() {
    var selected = [];

    addOnInputs.forEach(function (item) {
        if (item.checked) {
            selected.push(item.value);
        }
    });

    return selected;
}

function updateSummary() {
    var selectedAddOns = getSelectedAddOns();
    var total = prices.coffee;

    selectedAddOns.forEach(function (item) {
        total += prices.addOns[item];
    });

    if (giftInput.checked) {
        total += prices.gift;
    }

    document.getElementById("summaryCoffee").textContent = "Coffee: " + coffeeInput.value;
    document.getElementById("summaryRoast").textContent = "Roast: " + roastInput.value;
    document.getElementById("summaryGrind").textContent = "Grind: " + grindInput.value;
    document.getElementById("summaryAddons").textContent = "Add-ons: " + (selectedAddOns.join(", ") || "None");
    document.getElementById("summaryFrequency").textContent = "Delivery: " + frequencyInput.value;
    document.getElementById("summaryGift").textContent = "Gift: " + (giftInput.checked ? "Yes" : "No");
    document.getElementById("summaryPrice").textContent = "Price: £" + total;
}

function validateForm() {
    if (nameInput.value.trim() === "") {
        return "Enter your name";
    }

    if (emailInput.value.trim() === "") {
        return "Enter your email";
    }

    return "";
}

form.addEventListener("input", updateSummary);

form.addEventListener("submit", function (event) {
    var error = validateForm();

    event.preventDefault();

    if (error !== "") {
        message.textContent = error;
        return;
    }

    var subscription = {
        name: nameInput.value,
        email: emailInput.value,
        coffee: coffeeInput.value,
        roast: roastInput.value,
        grind: grindInput.value,
        addOns: getSelectedAddOns(),
        frequency: frequencyInput.value,
        gift: giftInput.checked
    };

    localStorage.setItem("subscriptionBox", JSON.stringify(subscription));
    message.textContent = "Subscription saved";
});

updateSummary();