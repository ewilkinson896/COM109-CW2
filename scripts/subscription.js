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
var coffeeOptions = ["House Blend", "Colombian Roast", "Espresso Mix"];
var roastOptions = ["Light", "Medium", "Dark"];
var grindOptions = ["Beans", "Coarse", "Fine"];
var coffeeDetails = loadCoffeeDetails();

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

function createCoffeeItem() {
    return {
        coffee: coffeeOptions[0],
        roast: roastOptions[1],
        grind: grindOptions[0]
    };
}

function normaliseCoffeeItem(item) {
    if (!item || typeof item !== "object") {
        return createCoffeeItem();
    }

    return {
        coffee: coffeeOptions.indexOf(item.coffee) === -1 ? coffeeOptions[0] : item.coffee,
        roast: roastOptions.indexOf(item.roast) === -1 ? roastOptions[1] : item.roast,
        grind: grindOptions.indexOf(item.grind) === -1 ? grindOptions[0] : item.grind
    };
}

function loadCoffeeDetails() {
    var savedCoffeeDetails = getCoffeeDetails();

    if (!savedCoffeeDetails.length) {
        return [];
    }

    return savedCoffeeDetails.map(normaliseCoffeeItem);
}

function saveCoffeeDetails() {
    localStorage.setItem("coffeeDetails", JSON.stringify(coffeeDetails));
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

function deleteCoffee(index) {
    coffeeDetails.splice(index, 1);
    saveCoffeeDetails();
    refreshView();
}

function addCoffee() {
    coffeeDetails.push(createCoffeeItem());
    saveCoffeeDetails();
    refreshView();
}

function updateCoffee(index, field, value) {
    if (!coffeeDetails[index]) {
        return;
    }

    coffeeDetails[index][field] = value;
    saveCoffeeDetails();
    updateSummary();
}

function renderCoffeeList() {
    coffeeList.innerHTML = "";

    coffeeDetails.forEach(function (item, index) {
        var coffeeBox = document.createElement("div");
        coffeeBox.className = "coffee-box";

        coffeeBox.innerHTML =
            '<div class="coffee-box-fields">' +
                '<label>Coffee ' + (index + 1) +
                    '<select data-field="coffee" data-index="' + index + '">' +
                        coffeeOptions.map(function (option) {
                            return '<option value="' + option + '"' + (option === item.coffee ? ' selected' : '') + '>' + option + '</option>';
                        }).join("") +
                    '</select>' +
                '</label>' +
                '<label>Roast' +
                    '<select data-field="roast" data-index="' + index + '">' +
                        roastOptions.map(function (option) {
                            return '<option value="' + option + '"' + (option === item.roast ? ' selected' : '') + '>' + option + '</option>';
                        }).join("") +
                    '</select>' +
                '</label>' +
                '<label>Grind' +
                    '<select data-field="grind" data-index="' + index + '">' +
                        grindOptions.map(function (option) {
                            return '<option value="' + option + '"' + (option === item.grind ? ' selected' : '') + '>' + option + '</option>';
                        }).join("") +
                    '</select>' +
                '</label>' +
            '</div>' +
            '<button type="button" class="delete-coffee-button" data-index="' + index + '">Delete</button>';

        coffeeList.appendChild(coffeeBox);
    });
}

function updateSummary() {
    var selectedAddOns = getSelectedAddOns();
    var total = coffeeDetails.length * prices.coffee;

    selectedAddOns.forEach(function (item) {
        total += prices.addOns[item];
    });

    if (giftInput.checked) {
        total += prices.gift;
    }

    document.getElementById("summaryCoffee").textContent = "Coffees: " + coffeeDetails.length + " selected";
    document.getElementById("summaryAddons").textContent = "Add-ons: " + (selectedAddOns.join(", ") || "None");
    document.getElementById("summaryFrequency").textContent = "Delivery: " + frequencyInput.value;
    document.getElementById("summaryGift").textContent = "Gift: " + (giftInput.checked ? "Yes" : "No");
    document.getElementById("summaryPrice").textContent = "Price: £" + total;
}

function refreshView() {
    renderCoffeeList();
    updateSummary();
}

function validateForm() {
    if (nameInput.value.trim() === "") {
        return "Enter your name";
    }

    if (emailInput.value.trim() === "") {
        return "Enter your email";
    }

    if (coffeeDetails.length === 0) {
        return "Choose at least one coffee";
    }

    return "";
}

window.addEventListener("pageshow", refreshView);
addCoffeeButton.addEventListener("click", function () {
    addCoffee();
});
coffeeList.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-coffee-button")) {
        deleteCoffee(Number(event.target.dataset.index));
    }
});

coffeeList.addEventListener("change", function (event) {
    if (!event.target.matches("select[data-field]")) {
        return;
    }

    updateCoffee(Number(event.target.dataset.index), event.target.dataset.field, event.target.value);
});

addOnInputs.forEach(function (item) {
    item.addEventListener("change", updateSummary);
});

frequencyInput.addEventListener("change", updateSummary);
giftInput.addEventListener("change", updateSummary);

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
        coffeeDetails: coffeeDetails,
        addOns: getSelectedAddOns(),
        frequency: frequencyInput.value,
        gift: giftInput.checked
    };

    localStorage.setItem("subscriptionBox", JSON.stringify(subscription));
    message.textContent = "Subscription saved";
});

if (!coffeeDetails.length) {
    coffeeDetails.push(createCoffeeItem());
}

saveCoffeeDetails();
refreshView();