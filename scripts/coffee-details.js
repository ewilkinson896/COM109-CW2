var coffeeDetailsForm = document.getElementById("coffeeDetailsForm");
var coffeeSelect = document.getElementById("coffee");
var roastSelect = document.getElementById("roast");
var grindSelect = document.getElementById("grind");
var coffeeMessage = document.getElementById("coffeeMessage");

function loadCoffeeDetails() {
    var savedCoffeeDetails = localStorage.getItem("coffeeDetails");

    if (!savedCoffeeDetails) {
        return;
    }

    savedCoffeeDetails = JSON.parse(savedCoffeeDetails);

    if (!Array.isArray(savedCoffeeDetails)) {
        return;
    }

    if (savedCoffeeDetails.length > 0) {
        roastSelect.value = savedCoffeeDetails[savedCoffeeDetails.length - 1].roast;
        grindSelect.value = savedCoffeeDetails[savedCoffeeDetails.length - 1].grind;
    }
}

coffeeDetailsForm.addEventListener("submit", function (event) {
    var savedCoffeeDetails = localStorage.getItem("coffeeDetails");
    var coffeeDetails = [];

    event.preventDefault();

    if (savedCoffeeDetails) {
        coffeeDetails = JSON.parse(savedCoffeeDetails);

        if (!Array.isArray(coffeeDetails)) {
            coffeeDetails = [];
        }
    }

    coffeeDetails.push({
        coffee: coffeeSelect.value,
        roast: roastSelect.value,
        grind: grindSelect.value
    });

    localStorage.setItem("coffeeDetails", JSON.stringify(coffeeDetails));

    coffeeMessage.textContent = "Coffee added";
    window.location.href = "subscription.html";
});

loadCoffeeDetails();