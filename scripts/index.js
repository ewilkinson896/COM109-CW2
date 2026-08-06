// Javascript for home page

var currentHour = new Date().getHours();

if (currentHour >= 7 && currentHour < 18) {
    document.getElementById("shopStatus").textContent = "We are currently OPEN";
} else {
    document.getElementById("shopStatus").textContent = "We are currently CLOSED";
}

document.getElementById("topBtn").addEventListener("click", function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});
