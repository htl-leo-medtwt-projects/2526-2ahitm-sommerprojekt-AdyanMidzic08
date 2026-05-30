import { dailysData } from "../data/dailys-data.js";

/*
 ************************************************
 ***************** DAILY QUIZ DATA *************
 ************************************************
 */

let dailyQuiz = {
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  coins: 0,
  correctAnswers: 0,
  running: false,
};

let knowledgeTemplate = document.getElementById("knowledge").innerHTML;

/*
 ************************************************
 ***************** DOM ELEMENTS ****************
 ************************************************
 */

let dailyModeButton = document.querySelector(".mode-btn-dailys");
let dailyNavButton = document.getElementById("daily-nav-btn");
let homeSection = document.getElementById("home");
let knowledgeSection = document.getElementById("knowledge");
let modeSwitch = document.getElementById("modeSwitch");

/*
 ************************************************
 ***************** UTILITIES *******************
 ************************************************
 */

function randomNumber(max) {
  return Math.floor(Math.random() * max);
}

function shuffleArray(arrayToShuffle) {
  for (
    let currentIndex = arrayToShuffle.length - 1;
    currentIndex > 0;
    currentIndex--
  ) {
    let randomIndex = randomNumber(currentIndex + 1);
    let temporaryValue = arrayToShuffle[currentIndex];
    arrayToShuffle[currentIndex] = arrayToShuffle[randomIndex];
    arrayToShuffle[randomIndex] = temporaryValue;
  }
}

function runLoading(onDone) {
  let loadingScreen = document.getElementById("loadingScreen");
  let loadingFill = document.getElementById("loadingFill");
  let loadingPercent = document.getElementById("loadingPercent");
  let isLoading = false;

  if (loadingScreen && loadingFill && loadingPercent && !isLoading) {
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

        if (typeof onDone === "function") {
          onDone();
        }
      }
    }, 20);
  } else {
    if (typeof onDone === "function") {
      onDone();
    }
  }
}

function showHomePage() {
  document.body.classList.toggle("knowledge-mode-active", false);
  document.body.classList.toggle("knowledge-navigation-hidden", false);
  if (modeSwitch) {
    modeSwitch.style.display = "";
  }

  // Show logic for Home sections like in handleFirstVisitLayout
  let isFirstVisit = localStorage.getItem("isFirstVisit");
  if (isFirstVisit !== "true" && isFirstVisit !== "false") {
    isFirstVisit = localStorage.getItem("factforgeProfile") ? "false" : "true";
  }

  let hero = document.querySelector(".hero");
  let tutorial = document.getElementById("tutorial");
  let modeSelect = document.querySelector(".mode-select");

  homeSection.style.display = "";
  homeSection.style.visibility = "visible";
  knowledgeSection.style.display = "none";

  if (isFirstVisit === "true") {
    if (hero) hero.style.display = "";
    if (tutorial) tutorial.style.display = "";
    if (modeSelect) modeSelect.style.display = "";
  } else {
    // If not first visit, maybe they clicked the nav link or home button
    // Let's make sure the hero and tutorial are visible again, since the script.js logic does this for nav links
    if (hero) hero.style.display = "";
    if (tutorial) tutorial.style.display = "";
    if (modeSelect) modeSelect.style.display = "";
  }
}

/*
 ************************************************
 ***************** DAILY TIME LOGIC ************
 ************************************************
 */

function getLastDailyPlayTime() {
  let lastTime = localStorage.getItem("factforgeDailyLastPlay");
  return lastTime ? parseInt(lastTime) : null;
}

function setDailyPlayTime() {
  let now = Date.now();
  localStorage.setItem("factforgeDailyLastPlay", now.toString());
}

function canPlayDaily() {
  let lastTime = getLastDailyPlayTime();
  let result;
  if (!lastTime) {
    result = true;
  } else {
    let now = Date.now();
    let hoursPassed = (now - lastTime) / (1000 * 60 * 60);
    result = hoursPassed >= 24;
  }
  return result;
}

function getTimeUntilNextDaily() {
  let lastTime = getLastDailyPlayTime();
  let result = 0;
  if (!lastTime) {
    result = 0;
  } else {
    let now = Date.now();
    let timeDiff = 24 * 60 * 60 * 1000 - (now - lastTime);

    if (timeDiff <= 0) {
      result = 0;
    } else {
      let hours = Math.floor(timeDiff / (1000 * 60 * 60));
      let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      result = { hours, minutes, seconds };
    }
  }
  return result;
}

function formatTimeRemaining(timeObj) {
  let result = "";
  if (!timeObj) {
    result = "Ready";
  } else {
    result = `${timeObj.hours}h ${timeObj.minutes}m`;
  }
  return result;
}

function updateDailyNavButton() {
  let result;
  if (!dailyNavButton) {
    result = undefined;
  } else {
    let isAvailable = canPlayDaily();

    if (dailyModeButton) {
      dailyModeButton.classList.toggle("daily-locked", !isAvailable);
      dailyModeButton.disabled = !isAvailable;
    }

    if (isAvailable) {
      if (dailyModeButton) {
        dailyModeButton.textContent = "Dailys";
        dailyModeButton.setAttribute("aria-disabled", "false");
      }
      dailyNavButton.textContent = "Dailys";
      dailyNavButton.style.opacity = "1";
      dailyNavButton.style.filter = "grayscale(0)";
      dailyNavButton.style.cursor = "pointer";
      dailyNavButton.classList.remove("daily-locked");
    } else {
      let timeRemaining = getTimeUntilNextDaily();
      let timeText = formatTimeRemaining(timeRemaining);
      dailyNavButton.textContent = timeText;
      if (dailyModeButton) {
        dailyModeButton.textContent = timeText;
        dailyModeButton.setAttribute("aria-disabled", "true");
      }
      dailyNavButton.style.opacity = "0.7";
      dailyNavButton.style.filter = "grayscale(0.5)";
      dailyNavButton.style.cursor = "not-allowed";
      dailyNavButton.classList.add("daily-locked");
    }
    result = undefined;
  }
  return result;
}

setInterval(updateDailyNavButton, 1000);
updateDailyNavButton();

/*
 ************************************************
 ***************** QUIZ RENDERING **************
 ************************************************
 */

function markAnswer(element, isCorrect) {
  if (element) {
    if (isCorrect === true) {
      element.style.backgroundColor = "#2d7d2d";
      element.style.borderColor = "#4caf50";
    } else {
      element.style.backgroundColor = "#7d2d2d";
      element.style.borderColor = "#f44336";
    }
  }
}

function lockClickAnswers(container) {
  let all = container.querySelectorAll(".quiz-simple-answer");
  for (let i = 0; i < all.length; i++) {
    let el = all[i];
    el.style.pointerEvents = "none";
  }
}

function applyScore(isCorrect) {
  if (isCorrect) {
    dailyQuiz.correctAnswers++;
    dailyQuiz.streak++;

    let points = 15 + dailyQuiz.streak;
    let coins = 10 + dailyQuiz.streak;
    dailyQuiz.score += points;
    dailyQuiz.coins += coins;

    let newDataCoins = localStorage.getItem("factforgeProfile");
    let profile = JSON.parse(newDataCoins);
    profile.coins = parseInt(profile.coins) + coins;
    profile.points = parseInt(profile.points) + points;
    profile.streak = parseInt(profile.streak || 0) + 1;
    localStorage.setItem("factforgeProfile", JSON.stringify(profile));
    if (typeof renderAchievements === "function") renderAchievements();
  } else {
    dailyQuiz.streak = 0;
  }
}

function updateHeaderAndProgress(card) {
  let questionNumber = dailyQuiz.currentIndex + 1;
  let total = dailyQuiz.questions.length;
  let progress = Math.round((questionNumber / total) * 100);

  let count = card.querySelector(".quiz-count");
  let points = card.querySelector(".quiz-points");
  let streak = card.querySelector(".quiz-streak");
  let bar = card.querySelector(".quiz-simple-progress-bar");
  let percent = card.querySelector(
    ".quiz-simple-progress-head span:last-child",
  );

  if (count) {
    count.textContent = `Daily ${questionNumber} of ${total}`;
  }

  if (points) {
    points.textContent = `${dailyQuiz.score} points`;
  }

  if (streak) {
    streak.textContent = `Streak: ${dailyQuiz.streak}`;
  }

  if (bar) {
    bar.style.width = progress + "%";
  }

  if (percent) {
    percent.textContent = progress + "%";
  }
}

function renderMultipleChoice(question, card) {
  let answers = card.querySelector(".quiz-simple-answers");
  if (answers) {
    let choices = question.choices.slice();
    shuffleArray(choices);

    let html = choices
      .map((choice) => `<div class="quiz-simple-answer">${choice}</div>`)
      .join("");
    answers.innerHTML = html;

    let allAnswers = answers.querySelectorAll(".quiz-simple-answer");
    for (let i = 0; i < allAnswers.length; i++) {
      let div = allAnswers[i];

      div.onclick = function () {
        window.playSound("mouseClick");
        lockClickAnswers(card);
        let choice = div.textContent;
        let isCorrect = choice === question.correctAnswer;
        applyScore(isCorrect);

        if (isCorrect) {
          markAnswer(div, true);
        } else {
          markAnswer(div, false);

          for (let j = 0; j < allAnswers.length; j++) {
            let a = allAnswers[j];
            if (a.textContent === question.correctAnswer) {
              markAnswer(a, true);
            }
          }
        }

        setTimeout(function () {
          nextStep();
        }, 1200);
      };
    }
  }
}

function nextStep() {
  if (dailyQuiz.currentIndex >= dailyQuiz.questions.length - 1) {
    showDailyEndScreen();
  } else {
    dailyQuiz.currentIndex++;
    renderDailyQuestion();
  }
}

function renderDailyQuestion() {
  if (dailyQuiz.running) {
    let question = dailyQuiz.questions[dailyQuiz.currentIndex];
    let card = document.querySelector(".quiz-mode.is-active");

    if (card) {
      updateHeaderAndProgress(card);

      let questionText = card.querySelector(".quiz-simple-question");
      if (questionText) {
        questionText.textContent = question.question;
      }

      renderMultipleChoice(question, card);
    }
  }
}

function loadDailyQuestions() {
  let result;
  try {
    let all = dailysData.dailyQuestions || [];
    shuffleArray(all);
    result = all.slice(0, 7);
  } catch (error) {
    console.error(error);
    result = [];
  }
  dailyQuiz.questions = result;
  return dailyQuiz.questions;
}

function resetDailyQuizData() {
  dailyQuiz.currentIndex = 0;
  dailyQuiz.score = 0;
  dailyQuiz.streak = 0;
  dailyQuiz.coins = 0;
  dailyQuiz.correctAnswers = 0;
  return (dailyQuiz.running = true);
}

function startDailyQuiz() {
  resetDailyQuizData();
  loadDailyQuestions();

  if (dailyQuiz.questions.length === 0) {
    knowledgeSection.innerHTML = "<p>Daily questions could not be loaded.</p>";
  } else {
    renderDailyQuestion();
  }
}

function showDailyEndScreen() {
  dailyQuiz.running = false;
  setDailyPlayTime();
  updateDailyNavButton();

  let total = dailyQuiz.questions.length;
  let accuracy = 0;
  if (total > 0) {
    accuracy = Math.round((dailyQuiz.correctAnswers / total) * 100);
  }

  if (accuracy >= 50) {
    window.playSound("victory");
  } else {
    window.playSound("losing");
  }

  knowledgeSection.innerHTML =
    '<div id="info-box">' +
    '<div class="quiz-results-screen">' +
    '<div class="userpage-head">' +
    "<h2>Daily Challenge Complete!</h2>" +
    "<p>Check your results below</p>" +
    "</div>" +
    '<div class="profile-main-grid">' +
    '<article class="profile-card profile-card-score">' +
    "<h3>Total Score</h3>" +
    '<p class="profile-big">' +
    dailyQuiz.score +
    "</p>" +
    '<p class="profile-sub">points earned</p>' +
    "</article>" +
    '<article class="profile-card profile-card-accuracy">' +
    "<h3>Accuracy</h3>" +
    '<p class="profile-big">' +
    accuracy +
    "%</p>" +
    '<p class="profile-sub">' +
    dailyQuiz.correctAnswers +
    " / " +
    total +
    " correct</p>" +
    "</article>" +
    '<article class="profile-card profile-card-coins">' +
    "<h3>Coins Collected</h3>" +
    '<p class="profile-big">' +
    dailyQuiz.coins +
    "</p>" +
    '<p class="profile-sub">from this attempt</p>' +
    "</article>" +
    '<article class="profile-card profile-card-streak">' +
    "<h3>Best Streak</h3>" +
    '<p class="profile-big">' +
    dailyQuiz.streak +
    "</p>" +
    '<p class="profile-sub">consecutive correct</p>' +
    "</article>" +
    "</div>" +
    '<div class="quiz-results-buttons" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">' +
    '<button id="dailyHomeBtn" class="quiz-home-btn" type="button">Home</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  let homeButton = document.getElementById("dailyHomeBtn");
  if (homeButton) {
    homeButton.onclick = function () {
      runLoading(function () {
        showHomePage();
        let hero = document.querySelector(".hero");
        let tutorialSection = document.getElementById("tutorial");
        if (hero) hero.style.display = "none";
        if (tutorialSection) tutorialSection.style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    };
  }
}

function showDailyLockedScreen() {
  let timeRemaining = getTimeUntilNextDaily();
  let timeText = formatTimeRemaining(timeRemaining);

  knowledgeSection.innerHTML =
    '<div id="info-box">' +
    '<div class="quiz-results-screen">' +
    '<div class="userpage-head">' +
    "<h2>Daily Challenge Locked</h2>" +
    "<p>You have already played today!</p>" +
    "</div>" +
    '<div class="profile-main-grid" style="display: flex; justify-content: center;">' +
    '<article class="profile-card profile-card-time" style="max-width: 400px; width: 100%;">' +
    "<h3>Time Until Next Daily</h3>" +
    '<p id="timeCountdown" class="profile-big" style="margin-top: 15px;">' +
    timeText +
    "</p>" +
    "</article>" +
    "</div>" +
    '<div class="quiz-results-buttons" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">' +
    '<button id="dailyLockedHomeBtn" class="quiz-home-btn" type="button">Home</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  let homeButton = document.getElementById("dailyLockedHomeBtn");
  if (homeButton) {
    homeButton.onclick = function () {
      runLoading(function () {
        showHomePage();
        let hero = document.querySelector(".hero");
        let tutorialSection = document.getElementById("tutorial");
        if (hero) hero.style.display = "none";
        if (tutorialSection) tutorialSection.style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    };
  }

  let countdownElement = document.getElementById("timeCountdown");
  let countdownInterval = setInterval(function () {
    let updated = getTimeUntilNextDaily();
    if (updated === 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = "Ready to play!";
    } else {
      countdownElement.textContent = formatTimeRemaining(updated);
    }
  }, 1000);
}

/*
 ************************************************
 ***************** EVENT LISTENERS **************
 ************************************************
 */

if (dailyModeButton) {
  dailyModeButton.addEventListener("click", function () {
    runLoading(function () {
      document.body.classList.toggle("knowledge-mode-active", true);
      document.body.classList.toggle("knowledge-navigation-hidden", true);
      if (modeSwitch) {
        modeSwitch.style.display = "none";
      }
      homeSection.style.display = "none";
      knowledgeSection.style.display = "flex";

      if (canPlayDaily()) {
        startDailyQuiz();
      } else {
        showDailyLockedScreen();
      }
    });
  });
}

if (dailyNavButton) {
  dailyNavButton.addEventListener("click", function (event) {
    event.preventDefault();

    if (!canPlayDaily()) {
      return;
    }

    runLoading(function () {
      document.body.classList.toggle("knowledge-mode-active", true);
      document.body.classList.toggle("knowledge-navigation-hidden", true);
      if (modeSwitch) {
        modeSwitch.style.display = "none";
      }
      homeSection.style.display = "none";
      knowledgeSection.style.display = "flex";

      if (canPlayDaily()) {
        startDailyQuiz();
      } else {
        showDailyLockedScreen();
      }
    });
  });
}
