/*
 ************************************************
 ***************** NAVIGATION *******************
 ************************************************
 */

let loadingScreen = document.getElementById("loadingScreen");
let loadingFill = document.getElementById("loadingFill");
let loadingPercent = document.getElementById("loadingPercent");
let isLoading = false;

//KI
function runLoading(onDone) {
  if (!loadingScreen || !loadingFill || !loadingPercent || isLoading) {
    if (typeof onDone === "function") {
      onDone();
    }
    return;
  }

  isLoading = true;
  loadingScreen.classList.remove("is-hidden");
  loadingFill.style.width = "0%";
  loadingPercent.textContent = "0%";

  let progress = 0;

  let loadingInterval = setInterval(function () {
    progress += 2;
    if (progress > 100) {
      progress = 100;
    }

    loadingFill.style.width = progress + "%";
    loadingPercent.textContent = progress + "%";

    if (progress === 100) {
      clearInterval(loadingInterval);
      loadingScreen.classList.add("is-hidden");
      isLoading = false;
      window.dispatchEvent(new CustomEvent("factforge:loading-done"));

      if (typeof onDone === "function") {
        onDone();
      }
    }
  }, 20);
}
//End KI

window.addEventListener("load", function () {
  runLoading();
});

let knowledge = document.querySelector(".mode-btn-knowledge");
let home = document.getElementById("home");
let knowledgeSection = document.getElementById("knowledge");
let navigationLinks = document.querySelector(".nav-links");

knowledgeSection.style.display = "none";

knowledge.addEventListener("click", function () {
  runLoading(function () {
    home.style.display = "none";
    knowledgeSection.style.display = "";
    if (navigationLinks) {
      navigationLinks.style.display = "none";
    }
  });
});
