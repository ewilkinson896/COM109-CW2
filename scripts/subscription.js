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
var frequencyInput = document.getElementById("frequency");
var giftInput = document.getElementById("gift");
var addOnInputs = document.querySelectorAll(".addon");
var message = document.getElementById("formMessage");
var addCoffeeButton = document.getElementById("addCoffeeButton");
var coffeeList = document.getElementById("coffeeList");

function getCoffeeDetails() {
    var savedCoffeeDetails = localStorage.getItem("coffeeDetails");

    if (savedCoffeeDetails) {
        savedCoffeeDetails = JSON.parse(savedCoffeeDetails);

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

function saveCoffeeDetails(coffeeDetails) {
    localStorage.setItem("coffeeDetails", JSON.stringify(coffeeDetails));
}

function deleteCoffee(index) {
    var coffeeDetails = getCoffeeDetails();

    coffeeDetails.splice(index, 1);
    saveCoffeeDetails(coffeeDetails);
    updateSummary();
}

function updateSummary() {
    var selectedAddOns = getSelectedAddOns();
    var coffeeDetails = getCoffeeDetails();
    var total = coffeeDetails.length * prices.coffee;

    selectedAddOns.forEach(function (item) {
        total += prices.addOns[item];
    });

    if (giftInput.checked) {
        total += prices.gift;
    }

    coffeeList.innerHTML = "";

    coffeeDetails.forEach(function (item, index) {
        var coffeeBox = document.createElement("div");
        coffeeBox.className = "coffee-box";
        coffeeBox.innerHTML = "<p>Coffee " + (index + 1) + ": " + item.coffee + "</p><p>Roast: " + item.roast + "</p><p>Grind: " + item.grind + "</p><button type=\"button\" class=\"delete-coffee-button\" data-index=\"" + index + "\">Delete</button>";
        coffeeList.appendChild(coffeeBox);
    });

    document.getElementById("summaryCoffee").textContent = "Coffees: " + coffeeDetails.length + " selected";
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

    if (getCoffeeDetails().length === 0) {
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

    event.preventDefault();

    if (error !== "") {
        message.textContent = error;
        return;
    }

    var subscription = {
        name: nameInput.value,
        email: emailInput.value,
        coffeeDetails: getCoffeeDetails(),
        addOns: getSelectedAddOns(),
        frequency: frequencyInput.value,
        gift: giftInput.checked
    };

    localStorage.setItem("subscriptionBox", JSON.stringify(subscription));
    message.textContent = "Subscription saved";
});

updateSummary();