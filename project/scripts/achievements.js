import { achievementsData } from "../data/achievements-data.js";

function isAchievementUnlocked(achievement, profile) {
  let isUnlocked = false;

  if (achievement.minCoins) {
    if (profile.coins >= achievement.minCoins) {
      isUnlocked = true;
    }
  }

  if (achievement.minPoints) {
    if (profile.points >= achievement.minPoints) {
      isUnlocked = true;
    }
  }

  if (achievement.minStreak) {
    if (profile.streak >= achievement.minStreak) {
      isUnlocked = true;
    }
  }

  return isUnlocked;
}

function getUnlockedAchievements() {
  let rawProfile = localStorage.getItem("factforgeProfile");
  let unlockedList = [];

  if (rawProfile) {
    let profile = JSON.parse(rawProfile);

    for (let i = 0; i < achievementsData.length; i++) {
      let achievement = achievementsData[i];
      if (isAchievementUnlocked(achievement, profile)) {
        unlockedList.push(achievement);
      }
    }
  }

  return unlockedList;
}

function renderAchievements() {
  let grid = document.querySelector('.achievements-grid');

  if (grid) {
    grid.innerHTML = '';

    let unlockedAchievements = getUnlockedAchievements();
    let unlockedIds = [];

    for (let i = 0; i < unlockedAchievements.length; i++) {
      unlockedIds.push(unlockedAchievements[i].id);
    }

    for (let i = 0; i < achievementsData.length; i++) {
      let achievement = achievementsData[i];
      let tile = document.createElement('article');

      let isUnlocked = false;
      for (let j = 0; j < unlockedIds.length; j++) {
        if (unlockedIds[j] === achievement.id) {
          isUnlocked = true;
          break;
        }
      }

      if (isUnlocked) {
        tile.className = 'achievement-tile unlocked';
      } else {
        tile.className = 'achievement-tile locked';
      }

      let img = document.createElement('img');
      img.src = achievement.icon;
      img.alt = achievement.name;
      tile.appendChild(img);

      let div = document.createElement('div');

      let h4 = document.createElement('h4');
      h4.textContent = achievement.name;
      div.appendChild(h4);

      let p = document.createElement('p');
      p.textContent = achievement.description;
      div.appendChild(p);

      tile.appendChild(div);
      grid.appendChild(tile);
    }

    let counter = document.getElementById('profileAchievementsProgress');
    if (counter) {
      let unlockedCount = getUnlockedAchievements().length;
      let totalCount = achievementsData.length;
      counter.textContent = unlockedCount + ' of ' + totalCount + ' unlocked';
    }
  }
}

window.renderAchievements = renderAchievements;

document.addEventListener('DOMContentLoaded', renderAchievements);


