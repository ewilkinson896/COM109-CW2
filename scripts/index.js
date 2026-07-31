// Javascript for home page

var currentHour = new Date().getHours();

if (currentHour >= 7 && currentHour < 18) {
    document.getElementById("shopStatus").textContent = "We are currently OPEN";
} else {
    document.getElementById("shopStatus").textContent = "We are currently CLOSED";
}

document.getElementById("topBtn").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
