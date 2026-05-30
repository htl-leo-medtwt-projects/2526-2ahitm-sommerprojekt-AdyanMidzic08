/*
 ************************************************
 ***************** IMPORTS **********************
 ************************************************
 */

import { knowledgeData } from "./data/knowledge-data.js";
import { openShop, updateShopDisplay } from "./scripts/shop.js";

window.playSound = function (soundType) {
  const sounds = {
    mouseClick: "./Audio/MouseClick.mp3",
    victory: "./Audio/Victory.mp3",
    losing: "./Audio/Losing.mp3",
    loading: "./Audio/LoadingEffect.mp3",
  };

  if (sounds[soundType]) {
    let audio = new Audio(sounds[soundType]);
    audio.play().catch(() => {});
  }
};

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
  if (loadingScreen && loadingFill && loadingPercent && !isLoading) {
    isLoading = true;
    playSound("loading");
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
    }, 10);
  } else {
    if (typeof onDone === "function") {
      onDone();
    }
  }
}
//End KI

function getStoredProfileName() {
  let rawProfile = localStorage.getItem("factforgeProfile");
  if (!rawProfile) return "-";
  let profile = JSON.parse(rawProfile);
  return profile.name || "-";
}

function getStoredPoints() {
  let rawProfile = localStorage.getItem("factforgeProfile");
  if (!rawProfile) return 0;
  let profile = JSON.parse(rawProfile);
  return profile.points || 0;
}

function getStoredCoins() {
  let rawProfile = localStorage.getItem("factforgeProfile");
  if (!rawProfile) return 0;
  let profile = JSON.parse(rawProfile);
  return profile.coins || 0;
}

function getStoredStreak() {
  let rawProfile = localStorage.getItem("factforgeProfile");
  if (!rawProfile) return 0;
  let profile = JSON.parse(rawProfile);
  return profile.streak || 0;
}

function getStoredPlaytime() {
  let rawProfile = localStorage.getItem("factforgeProfile");
  if (!rawProfile) return 0;
  let profile = JSON.parse(rawProfile);
  return profile.playtime || 0;
}

function renderProfileName() {
  let nameElement = document.getElementById("profileDisplayName");
  let streakElement = document.getElementById("profileDisplayStreak");
  let streakMeterFill = document.getElementById("profileStreakMeterFill");
  let pointsElement = document.getElementById("profileDisplayPoints");
  let coinsElement = document.getElementById("profileDisplayCoins");
  let coinsGoalElement = document.getElementById("profileDisplayCoinsGoal");
  let playtimeElement = document.getElementById("profileDisplayPlaytime");

  nameElement.innerHTML = "Player: " + getStoredProfileName();

  let streak = getStoredStreak();
  streakElement.innerHTML = streak + " days";
  let streakPercent = (streak / 7) * 100;
  if (streakPercent > 100) {
    streakPercent = 100;
  }
  streakMeterFill.style.width = streakPercent + "%";

  let points = getStoredPoints();
  pointsElement.innerHTML = points;

  let coins = getStoredCoins();
  coinsElement.innerHTML = coins;
  let nextGoal = coins + 100;
  coinsGoalElement.innerHTML = "Next goal: " + nextGoal;

  let playtime = getStoredPlaytime();
  let hours = Math.floor(playtime / 3600);
  let minutes = Math.floor((playtime % 3600) / 60);
  playtimeElement.innerHTML = hours + "h " + minutes + "m";
}

function initializeSetupScreen() {
  let setupScreen = document.getElementById("nameSetupScreen");
  let setupInput = document.getElementById("setupNameInput");
  let setupBtn = document.getElementById("setupStartBtn");

  let profileData = localStorage.getItem("factforgeProfile");

  if (profileData) {
    setupScreen.classList.add("hidden");
  } else {
    setupScreen.classList.remove("hidden");
  }

  setupBtn.addEventListener("click", function () {
    let name = setupInput.value.trim();
    let errorElement = document.getElementById("setupError");

    if (name.length > 0) {
      const profile = {
        name: name,
        streak: 0,
        coins: 0,
        points: 0,
        playtime: 0,
        achievements: [],
      };

      localStorage.setItem("factforgeProfile", JSON.stringify(profile));
      localStorage.setItem("isFirstVisit", "true");
      setupScreen.classList.add("hidden");
      errorElement.classList.remove("show");

      runLoading(function () {
        renderProfileName();
        handleFirstVisitLayout();
      });
    } else {
      errorElement.innerHTML = "Name must be at least 1 character!";
      errorElement.classList.add("show");

      setTimeout(function () {
        errorElement.classList.remove("show");
      }, 2000);
    }
  });
}

function handleFirstVisitLayout() {
  let isFirstVisit = localStorage.getItem("isFirstVisit");

  let hero = document.querySelector(".hero");
  let tutorial = document.getElementById("tutorial");
  let modeSelect = document.querySelector(".mode-select");
  let homeSection = document.getElementById("home");

  if (isFirstVisit === "true") {
    // Erste Anmeldung: Alles anzeigen
    if (homeSection) homeSection.style.display = "";
    if (hero) hero.style.display = "";
    if (tutorial) tutorial.style.display = "";
    if (modeSelect) modeSelect.style.display = "";
    localStorage.setItem("isFirstVisit", "false");
  } else if (isFirstVisit === "false") {
    // Wiederholte Anmeldung: Nur Mode Select anzeigen
    if (homeSection) homeSection.style.display = "";
    if (hero) hero.style.display = "none";
    if (tutorial) tutorial.style.display = "none";
    if (modeSelect) modeSelect.style.display = "";
  }
}

window.addEventListener("load", function () {
  initializeSetupScreen();
  renderProfileName();

  document.getElementById("home").style.display = "";

  if (localStorage.getItem("factforgeProfile")) {
    runLoading(function () {
      handleFirstVisitLayout();
    });
  }
});

let knowledgeModeButton = document.querySelector(".mode-btn-knowledge");
let homeSection = document.getElementById("home");
let knowledgeSection = document.getElementById("knowledge");
let navigationLinks = document.querySelector(".nav-links");
let userButton = document.getElementById("user-btn");
let userPage = document.getElementById("UserPage");
let shopButton = document.getElementById("shop-nav-btn");
let shopSection = document.getElementById("shop");
let tutorialLink = document.querySelector('.nav-links a[href="#tutorial"]');
let homeLink = document.querySelector('.nav-links a[href="./index.html"]');
let tutorialSection = document.getElementById("tutorial");
let modeSwitch = document.getElementById("modeSwitch");

knowledgeSection.style.display = "none";
userPage.style.display = "none";
shopSection.style.display = "none";

function setKnowledgeModeActive(isActive) {
  document.body.classList.toggle("knowledge-mode-active", isActive);
}

function setNavigationVisible(isVisible) {
  document.body.classList.toggle("knowledge-navigation-hidden", !isVisible);
}

function setModeSwitchVisible(isVisible) {
  if (modeSwitch) {
    modeSwitch.style.display = isVisible ? "" : "none";
  }
}

function showHomePage() {
  setKnowledgeModeActive(false);
  setNavigationVisible(true);
  homeSection.style.display = "";
  homeSection.style.visibility = "visible";
  knowledgeSection.style.display = "none";
  userPage.style.display = "none";
  shopSection.style.display = "none";
  handleFirstVisitLayout();
}

userButton.addEventListener("click", function (event) {
  event.preventDefault();

  runLoading(function () {
    renderProfileName();
    if (typeof renderAchievements === "function") renderAchievements();
    homeSection.style.display = "none";
    knowledgeSection.style.display = "none";
    shopSection.style.display = "none";
    userPage.style.display = "flex";
  });
});

shopButton.addEventListener("click", function (event) {
  event.preventDefault();

  runLoading(function () {
    homeSection.style.display = "none";
    knowledgeSection.style.display = "none";
    userPage.style.display = "none";
    shopSection.style.display = "block";
    updateShopDisplay();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

tutorialLink.addEventListener("click", function (event) {
  event.preventDefault();

  runLoading(function () {
    showHomePage();
    tutorialSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

homeLink.addEventListener("click", function (event) {
  event.preventDefault();

  runLoading(function () {
    showHomePage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (button) {
    playSound("mouseClick");
  }
});

class Player {
  constructor(name) {
    this.name = name;
    this.points = 0;
    this.coins = 0;
    this.achievements = [];
    this.score = 0;
  }

  addAchievement(achievement) {
    if (!this.achievements.includes(achievement)) {
      this.achievements.push(achievement);
    }
  }

  addPoints(points) {
    this.points += points;
    this.score = this.points;
  }

  addCoins(coins) {
    this.coins += coins;
  }

  addScore(points) {
    this.addPoints(points);
  }
}

let knowledgeTemplate = knowledgeSection.innerHTML;

let quiz = {
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  coins: 0,
  correctAnswers: 0,
  currentMode: "multiple-choice",
  usedModes: [],
  running: false,
  trueFalseState: null,
};

let modes = ["multiple-choice", "input-mode", "true-false", "hint-mode"];

function randomNumber(max) {
  return Math.floor(Math.random() * max);
}

// Das nicht immer die selben Sachen angezeigt werden in der REihenfolge
// Mischt ein Array, damit Reihenfolgen unterschiedlich sind.
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

// Wählt einen zufälligen Modus, der nicht der aktuelle ist.
function getRandomMode() {
  let nextMode = quiz.currentMode;

  while (nextMode === quiz.currentMode) {
    nextMode = modes[randomNumber(modes.length)];
  }

  return nextMode;
}

// Gibt den Index eines Modus aus dem modes-Array zurueck.
function getModeIndex(mode) {
  let modeIndex = 0;

  for (let modePosition = 0; modePosition < modes.length; modePosition++) {
    if (modes[modePosition] === mode) {
      modeIndex = modePosition;
    }
  }

  return modeIndex;
}

// Setzt alle Quiz-Werte fuer einen neuen Lauf zurueck.
function resetQuizData() {
  quiz.currentIndex = 0;
  quiz.score = 0;
  quiz.streak = 0;
  quiz.bestStreak = 0;
  quiz.coins = 0;
  quiz.correctAnswers = 0;
  quiz.currentMode = "multiple-choice";
  quiz.usedModes = [];
  quiz.running = true;
  quiz.trueFalseState = null;
}

// Aktiviert den passenden Modus im UI und deaktiviert die anderen.
function setModeUI(mode) {
  let modeIndex = getModeIndex(mode);
  let modeCards = document.querySelectorAll(".quiz-mode");

  for (let cardIndex = 0; cardIndex < modeCards.length; cardIndex++) {
    let currentModeCard = modeCards[cardIndex];
    let isActive = cardIndex === modeIndex;

    if (isActive) {
      currentModeCard.hidden = false;
      currentModeCard.classList.add("is-active");
    } else {
      currentModeCard.hidden = true;
      currentModeCard.classList.remove("is-active");
    }
  }

  let modeButtons = document.querySelectorAll(".quiz-mode-btn");

  for (let buttonIndex = 0; buttonIndex < modeButtons.length; buttonIndex++) {
    let currentModeButton = modeButtons[buttonIndex];

    if (buttonIndex === modeIndex) {
      currentModeButton.classList.add("is-active");
    } else {
      currentModeButton.classList.remove("is-active");
    }
  }
}

// Aktualisiert Fragezähler, Punkte, Streak und Fortschrittsanzeige.
function updateHeaderAndProgress(card) {
  let questionNumber = quiz.currentIndex + 1;
  let total = quiz.questions.length;
  let progress = Math.round((questionNumber / total) * 100);

  let count = card.querySelector(".quiz-count");
  let points = card.querySelector(".quiz-points");
  let streak = card.querySelector(".quiz-streak");
  let bar = card.querySelector(".quiz-simple-progress-bar");
  let percent = card.querySelector(
    ".quiz-simple-progress-head span:last-child",
  );

  if (count) {
    count.textContent = "Question " + questionNumber + " of " + total;
  }

  if (points) {
    points.textContent = quiz.score + " points";
  }

  if (streak) {
    streak.textContent = "Streak: " + quiz.streak;
  }

  if (bar) {
    bar.style.width = progress + "%";
  }

  if (percent) {
    percent.textContent = progress + "%";
  }
}

// Färbt eine Antwort als richtig oder falsch ein.
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

// Sperrt alle Antwortelemente in der aktuellen Quiz-Karte.
function lockClickAnswers(container) {
  let all = container.querySelectorAll(
    ".quiz-simple-answer, .quiz-boolean-btn",
  );
  for (let i = 0; i < all.length; i++) {
    let el = all[i];
    el.style.pointerEvents = "none";
  }
}

// Berechnet Punkte, Coins und Streak nach einer Antwort.
function applyScore(isCorrect) {
  if (isCorrect) {
    quiz.correctAnswers++;
    quiz.streak++;

    if (quiz.streak > quiz.bestStreak) {
      quiz.bestStreak = quiz.streak;
    }

    let points = 10 + quiz.streak;
    let coins = 5 + quiz.streak;
    quiz.score += points;
    quiz.coins += coins;

    let newDataCoins = localStorage.getItem("factforgeProfile");
    let profile = JSON.parse(newDataCoins);
    profile.coins = parseInt(profile.coins) + coins;
    profile.points = parseInt(profile.points) + points;
    localStorage.setItem("factforgeProfile", JSON.stringify(profile));
    renderProfileName();
    if (typeof renderAchievements === "function") renderAchievements();
  } else {
    quiz.streak = 0;
  }
}

// Wechselt zur nächsten Frage oder beendet das Quiz.
function nextStep() {
  if (quiz.currentIndex >= quiz.questions.length - 1) {
    showEndScreen();
  } else {
    quiz.currentIndex++;
    quiz.currentMode = getRandomMode();
    renderQuestion();
  }
}

// Fuehrt den nächsten Quiz-Schritt mit kurzer Verzögerung aus.
function answerDone(delay) {
  setTimeout(function () {
    nextStep();
  }, delay || 1200);
}

// Rendert den Multiple-Choice-Modus und verarbeitet Klicks.
function renderMultipleChoice(question, card) {
  window.playSound("mouseClick");
  let answers = card.querySelector(".quiz-simple-answers");
  if (answers) {
    let choices = question.choices.slice();
    shuffleArray(choices);

    let html = "";
    for (let i = 0; i < choices.length; i++) {
      html += '<div class="quiz-simple-answer" data-choice-index="' + i + '">';
      html += choices[i];
      html += "</div>";
    }
    answers.innerHTML = html;

    let allAnswers = answers.querySelectorAll(".quiz-simple-answer");
    for (let i = 0; i < allAnswers.length; i++) {
      let div = allAnswers[i];

      div.onclick = function () {
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

        answerDone();
      };
    }
  }
}

// Rendert den Input-Modus und prueft die Texteingabe.
function renderInputMode(question, card) {
  let field = card.querySelector(".quiz-input-field");
  let button = card.querySelector(".quiz-input-submit");

  if (field && button) {
    field.value = "";
    field.disabled = false;
    field.style.backgroundColor = "";
    field.style.borderColor = "";
    button.disabled = false;

    // Prüft die Eingabe und verarbeitet das Ergebnis.
    function submitInput() {
      if (!button.disabled) {
        let userAnswer = field.value.trim().toLowerCase();
        let correct = String(question.correctAnswer).trim().toLowerCase();

        let isCorrect = false;
        if (userAnswer === correct) {
          isCorrect = true;
        }

        applyScore(isCorrect);
        field.disabled = true;
        button.disabled = true;
        markAnswer(field, isCorrect);
        answerDone();
      }
    }

    button.onclick = submitInput;
    field.onkeydown = function (event) {
      if (event.key === "Enter") {
        submitInput();
      }
    };
  }
}

// Rendert den True/False-Modus mit zufälliger Aussage.
function renderTrueFalse(question, card) {
  let text = card.querySelector(".quiz-simple-question");
  let buttons = card.querySelectorAll(".quiz-boolean-btn");

  if (text && buttons.length >= 2) {
    let fakeChoices = [];
    for (let i = 0; i < question.choices.length; i++) {
      let choice = question.choices[i];
      if (choice !== question.correctAnswer) {
        fakeChoices.push(choice);
      }
    }

    let showCorrect = Math.random() > 0.5;
    let shownAnswer = question.correctAnswer;
    if (!showCorrect && fakeChoices.length > 0) {
      shownAnswer = fakeChoices[randomNumber(fakeChoices.length)];
    }

    quiz.trueFalseState = {
      showCorrect: showCorrect,
    };

    text.textContent = question.question + " -> " + shownAnswer;

    let trueBtn = buttons[0];
    let falseBtn = buttons[1];

    trueBtn.style.backgroundColor = "";
    trueBtn.style.borderColor = "";
    falseBtn.style.backgroundColor = "";
    falseBtn.style.borderColor = "";
    trueBtn.style.pointerEvents = "auto";
    falseBtn.style.pointerEvents = "auto";

    trueBtn.onclick = function () {
      lockClickAnswers(card);
      let isCorrect = quiz.trueFalseState.showCorrect === true;
      applyScore(isCorrect);

      if (isCorrect) {
        markAnswer(trueBtn, true);
      } else {
        markAnswer(trueBtn, false);
        markAnswer(falseBtn, true);
      }

      answerDone();
    };

    falseBtn.onclick = function () {
      lockClickAnswers(card);
      let isCorrect = quiz.trueFalseState.showCorrect === false;
      applyScore(isCorrect);

      if (isCorrect) {
        markAnswer(falseBtn, true);
      } else {
        markAnswer(falseBtn, false);
        markAnswer(trueBtn, true);
      }

      answerDone();
    };
  }
}

// Rendert den Hint-Modus mit zwei möglichen Antworten.
function renderHintMode(question, card) {
  window.playSound("mouseClick");
  let hint = card.querySelector(".quiz-hint-box");
  let answers = card.querySelector(".quiz-simple-answers");

  if (answers) {
    let wrongChoices = [];
    for (let i = 0; i < question.choices.length; i++) {
      let choice = question.choices[i];
      if (choice !== question.correctAnswer) {
        wrongChoices.push(choice);
      }
    }

    shuffleArray(wrongChoices);
    let list = [question.correctAnswer, wrongChoices[0]];
    shuffleArray(list);

    if (hint) {
      let first = String(question.correctAnswer).charAt(0).toUpperCase();
      let length = String(question.correctAnswer).length;
      hint.textContent =
        "Hint: starts with " + first + " and has " + length + " letters";
    }

    let html = "";
    for (let i = 0; i < list.length; i++) {
      html += '<div class="quiz-simple-answer" data-hint-index="' + i + '">';
      html += list[i];
      html += "</div>";
    }
    answers.innerHTML = html;

    let allHintAnswers = answers.querySelectorAll(".quiz-simple-answer");

    for (let i = 0; i < allHintAnswers.length; i++) {
      let div = allHintAnswers[i];

      div.onclick = function () {
        lockClickAnswers(card);
        let choice = div.textContent;
        let isCorrect = choice === question.correctAnswer;
        applyScore(isCorrect);

        if (isCorrect) {
          markAnswer(div, true);
        } else {
          markAnswer(div, false);

          for (let j = 0; j < allHintAnswers.length; j++) {
            let a = allHintAnswers[j];
            if (a.textContent === question.correctAnswer) {
              markAnswer(a, true);
            }
          }
        }

        answerDone();
      };
    }
  }
}

// Rendert die aktuelle Frage im aktiven Modus.
function renderQuestion() {
  if (quiz.running) {
    let question = quiz.questions[quiz.currentIndex];
    let mode = quiz.currentMode;
    let modeIndex = getModeIndex(mode);
    setModeUI(mode);

    let cards = document.querySelectorAll(".quiz-mode");
    let activeCard = null;

    if (modeIndex >= 0 && modeIndex < cards.length) {
      activeCard = cards[modeIndex];
    }

    if (activeCard) {
      updateHeaderAndProgress(activeCard);

      let questionText = activeCard.querySelector(".quiz-simple-question");
      if (questionText && mode !== "true-false") {
        questionText.textContent = question.question;
      }

      if (mode === "multiple-choice") {
        renderMultipleChoice(question, activeCard);
      }

      if (mode === "input-mode") {
        renderInputMode(question, activeCard);
      }

      if (mode === "true-false") {
        renderTrueFalse(question, activeCard);
      }

      if (mode === "hint-mode") {
        renderHintMode(question, activeCard);
      }
    }
  }
}

// Zeigt den Endscreen mit Score, Statistik und Restart.
function showEndScreen() {
  quiz.running = false;

  let total = quiz.questions.length;
  let accuracy = 0;
  if (total > 0) {
    accuracy = Math.round((quiz.correctAnswers / total) * 100);
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
    "<h2>Quiz Complete</h2>" +
    "<p>Check your results below</p>" +
    "</div>" +
    '<div class="profile-main-grid">' +
    '<article class="profile-card profile-card-score">' +
    "<h3>Total Score</h3>" +
    '<p class="profile-big">' +
    quiz.score +
    "</p>" +
    '<p class="profile-sub">points earned</p>' +
    "</article>" +
    '<article class="profile-card profile-card-accuracy">' +
    "<h3>Accuracy</h3>" +
    '<p class="profile-big">' +
    accuracy +
    "%</p>" +
    '<p class="profile-sub">' +
    quiz.correctAnswers +
    " / " +
    total +
    " correct</p>" +
    "</article>" +
    '<article class="profile-card profile-card-coins">' +
    "<h3>Coins Collected</h3>" +
    '<p class="profile-big">' +
    quiz.coins +
    "</p>" +
    '<p class="profile-sub">from this quiz</p>' +
    "</article>" +
    '<article class="profile-card profile-card-streak">' +
    "<h3>Best Streak</h3>" +
    '<p class="profile-big">' +
    quiz.bestStreak +
    "</p>" +
    '<p class="profile-sub">consecutive correct</p>' +
    "</article>" +
    "</div>" +
    '<div class="quiz-results-buttons" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">' +
    '<button id="quizRestartBtn" class="quiz-restart-btn">Play Again</button>' +
    '<button id="quizHomeBtn" class="quiz-home-btn" type="button">Home</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  let restart = document.getElementById("quizRestartBtn");
  if (restart) {
    restart.onclick = function () {
      runLoading(function () {
        startKnowledgeQuiz();
      });
    };
  }

  let homeButton = document.getElementById("quizHomeBtn");
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

// Laedt Fragen aus der Knowledge-Datenbank und waehlt 10 aus.
async function loadKnowledgeQuestions() {
  try {
    let all = knowledgeData.questions || [];
    shuffleArray(all);
    quiz.questions = all.slice(0, 10);
  } catch (error) {
    console.error(error);
    quiz.questions = [];
  }
}

// Startet den Knowledge-Quiz von vorne.
async function startKnowledgeQuiz() {
  resetQuizData();
  await loadKnowledgeQuestions();

  if (quiz.questions.length === 0) {
    knowledgeSection.innerHTML = "<p>Questions could not be loaded.</p>";
  } else {
    quiz.currentMode = modes[randomNumber(modes.length)];
    renderQuestion();
  }
}

knowledgeModeButton.addEventListener("click", function () {
  runLoading(function () {
    setKnowledgeModeActive(true);
    setNavigationVisible(false);
    setModeSwitchVisible(true);
    homeSection.style.display = "none";
    homeSection.style.visibility = "hidden";
    userPage.style.display = "none";
    shopSection.style.display = "none";
    knowledgeSection.style.display = "flex";
    knowledgeSection.style.visibility = "visible";

    // Force browser repaint
    void knowledgeSection.offsetWidth;

    startKnowledgeQuiz();
  });
});
