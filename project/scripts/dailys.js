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
  homeSection.style.display = "";
  knowledgeSection.style.display = "none";
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

  knowledgeSection.innerHTML = `
    <div class="quiz-results-screen footer">
      <div class="footer-container quiz-results-container">
        <section class="footer-section quiz-results-summary">
          <h3>Daily Challenge Complete!</h3>
          <p class="quiz-results-score">${dailyQuiz.score} points</p>
          <p>Correct answers: ${dailyQuiz.correctAnswers} / ${total}</p>
          <p>Accuracy: ${accuracy}%</p>
        </section>
        <section class="footer-section quiz-results-stats">
          <h3>Stats</h3>
          <p>Coins collected: ${dailyQuiz.coins}</p>
          <p>Streak: ${dailyQuiz.streak}</p>
        </section>
        <section class="footer-section quiz-results-action">
          <h3>Come Back Tomorrow!</h3>
          <p>Return in 24 hours for your next daily challenge.</p>
          <div class="quiz-results-buttons">
            <button id="dailyHomeBtn" class="quiz-home-btn" type="button">Home</button>
          </div>
        </section>
      </div>
      <div class="footer-bottom">See you tomorrow for the next daily challenge!</div>
    </div>
  `;

  let homeButton = document.getElementById("dailyHomeBtn");
  if (homeButton) {
    homeButton.onclick = function () {
      showHomePage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }
}

function showDailyLockedScreen() {
  let timeRemaining = getTimeUntilNextDaily();
  let timeText = formatTimeRemaining(timeRemaining);

  knowledgeSection.innerHTML = `
    <div class="quiz-results-screen footer">
      <div class="footer-container quiz-results-container">
        <section class="footer-section quiz-results-summary">
          <h3>Daily Challenge Locked</h3>
          <p>You have already played today!</p>
        </section>
        <section class="footer-section quiz-results-stats">
          <h3>Time Until Next Daily</h3>
          <p id="timeCountdown" style="font-size: 1.5em; font-weight: bold;">${timeText}</p>
        </section>
        <section class="footer-section quiz-results-action">
          <h3>Come Back Later</h3>
          <p>Return when the timer reaches zero for your next challenge.</p>
          <div class="quiz-results-buttons">
            <button id="dailyLockedHomeBtn" class="quiz-home-btn" type="button">Home</button>
          </div>
        </section>
      </div>
      <div class="footer-bottom">Daily challenges reset every 24 hours.</div>
    </div>
  `;

  let homeButton = document.getElementById("dailyLockedHomeBtn");
  if (homeButton) {
    homeButton.onclick = function () {
      showHomePage();
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      document.body.classList.toggle("knowledge-navigation-hidden", false);
      if (modeSwitch) {
        modeSwitch.style.display = "none";
      }
      homeSection.style.display = "none";
      knowledgeSection.style.display = "";

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
      document.body.classList.toggle("knowledge-navigation-hidden", false);
      if (modeSwitch) {
        modeSwitch.style.display = "none";
      }
      homeSection.style.display = "none";
      knowledgeSection.style.display = "";

      if (canPlayDaily()) {
        startDailyQuiz();
      } else {
        showDailyLockedScreen();
      }
    });
  });
}
