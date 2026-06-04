let shopItems = {
  "xp-boost": {
    name: "XP Boost",
    price: 50,
    description: "+2x XP for the next 5 quizzes",
  },
  "coin-boost": {
    name: "Coin Boost",
    price: 50,
    description: "+2x Coins for the next 5 quizzes",
  },
  "streak-shield": {
    name: "Streak Shield",
    price: 100,
    description: "Protect your daily streak once",
  },
};

export let activeBoosts = {
  xpBoost: 0,
  coinBoost: 0,
  streakShield: 0,
};

const TIMER_DURATION = 1800;
let shopTimers = {
  "xp-boost": 0,
  "coin-boost": 0,
  "streak-shield": 0,
};

let timerInterval = null;

export function initShop() {
  let buyBtns = document.querySelectorAll(".shop-buy-btn");

  loadTimers();

  buyBtns.forEach((btn) => {
    btn.addEventListener("click", handleBuyClick);
  });

  updateShopDisplay();

  startTimerInterval();
}

export function openShop() {
  let homeSection = document.getElementById("home");
  let knowledgeSection = document.getElementById("knowledge");
  let userPage = document.getElementById("UserPage");
  let shop = document.getElementById("shop");
  let manualIcons = document.querySelector(".manual-icons");
  let headlineIcons = document.querySelectorAll(".headline-icon");

  homeSection.style.display = "none";
  knowledgeSection.style.display = "none";
  userPage.style.display = "none";

  if (manualIcons) {
    manualIcons.style.display = "none";
  }
  headlineIcons.forEach((icon) => {
    icon.style.display = "none";
  });

  shop.style.display = "block";

  updateShopDisplay();
  window.scrollTo(0, 0);
}

function handleBuyClick(e) {
  let item = e.target.closest(".shop-item");
  let itemId = item.dataset.item;

  let playerData = JSON.parse(localStorage.getItem("factforgeProfile")) || {
    name: "Player",
    coins: 0,
    points: 0,
    streak: 0,
    playtime: 0,
  };

  let itemPrice = shopItems[itemId].price;

  if (shopTimers[itemId] > 0) {
    let minutes = Math.ceil(shopTimers[itemId] / 60);
    showNotification(
      `[COOLDOWN] Item on cooldown! Available in ${minutes} minute(s)`,
    );
    return;
  }

  if (playerData.coins >= itemPrice) {
    playerData.coins -= itemPrice;

    switch (itemId) {
      case "xp-boost":
        activeBoosts.xpBoost = 5;
        showNotification(`[SUCCESS] XP Boost activated for 5 quizzes!`);
        break;
      case "coin-boost":
        activeBoosts.coinBoost = 5;
        showNotification(`[COINS] Coin Boost activated for 5 quizzes!`);
        break;
      case "streak-shield":
        activeBoosts.streakShield = 1;
        showNotification(`[SHIELD] Streak Shield activated!`);
        break;
    }

    shopTimers[itemId] = TIMER_DURATION;

    localStorage.setItem("factforgeProfile", JSON.stringify(playerData));
    localStorage.setItem("activeBoosts", JSON.stringify(activeBoosts));
    saveTimers();

    updateShopDisplay();
  } else {
    showNotification(
      `[ERROR] Not enough coins! Need ${itemPrice}, you have ${playerData.coins}`,
    );
  }
}

export function updateShopDisplay() {
  let playerData = JSON.parse(localStorage.getItem("factforgeProfile")) || {
    coins: 0,
  };

  let coinsDisplay = document.getElementById("shopCoinsDisplay");
  if (coinsDisplay) {
    coinsDisplay.textContent = playerData.coins;
  }

  let buyBtns = document.querySelectorAll(".shop-buy-btn");
  buyBtns.forEach((btn) => {
    let item = btn.closest(".shop-item");
    let itemId = item.dataset.item;
    let itemPrice = shopItems[itemId].price;
    let remainingTime = shopTimers[itemId];

    if (remainingTime > 0) {
      btn.disabled = true;
      let minutes = Math.floor(remainingTime / 60);
      let seconds = remainingTime % 60;
      btn.textContent = `Available in ${minutes}:${seconds.toString().padStart(2, "0")}`;
      btn.style.opacity = "0.6";
    } else if (playerData.coins < itemPrice) {
      btn.disabled = true;
      btn.textContent = `Buy (Need ${itemPrice})`;
      btn.style.opacity = "1";
    } else {
      btn.disabled = false;
      btn.textContent = "Buy";
      btn.style.opacity = "1";
    }
  });
}

function showNotification(message) {
  let notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #5d4dc7 0%, #d373c5 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-family: basicFont;
    font-size: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

export function getActiveBoosts() {
  return activeBoosts;
}

export function decreaseBoostCounter() {
  if (activeBoosts.xpBoost > 0) activeBoosts.xpBoost--;
  if (activeBoosts.coinBoost > 0) activeBoosts.coinBoost--;
  localStorage.setItem("activeBoosts", JSON.stringify(activeBoosts));
}

export function loadBoosts() {
  let saved = localStorage.getItem("activeBoosts");
  if (saved) {
    activeBoosts = JSON.parse(saved);
  }
}

//KI
function loadTimers() {
  let saved = localStorage.getItem("shopTimers");
  if (saved) {
    let savedTimers = JSON.parse(saved);
    Object.keys(savedTimers).forEach((itemId) => {
      if (savedTimers[itemId] > 0) {
        shopTimers[itemId] = savedTimers[itemId];
      } else {
        shopTimers[itemId] = 0;
      }
    });
  }
}

function saveTimers() {
  localStorage.setItem("shopTimers", JSON.stringify(shopTimers));
}

function startTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    let hasActiveTimer = false;

    Object.keys(shopTimers).forEach((itemId) => {
      if (shopTimers[itemId] > 0) {
        shopTimers[itemId]--;
        hasActiveTimer = true;
      }
    });

    saveTimers();

    updateShopDisplay();

    if (!hasActiveTimer) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
}
//END

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initShop);
} else {
  initShop();
}
