//           MUSIC SYSTEM
// ========================================

let SONG_PATHS = {
  song1: "./Audio/Background-Music/BadMemories.mp3",
  song2: "./Audio/Background-Music/Jungle.mp3",
  song3: "./Audio/Background-Music/Kygo.mp3",
};

let STORAGE_KEYS = {
  song: "factforgeSong",
  muted: "factforgeMuted",
};

let musicAudio = null;
let currentSong = null;
let isMuted = false;
let musicVolume = 0.5;

// ── Init ──────────────────────────────────────────────────────────────────────

function initMusicPlayer() {
  musicAudio = new Audio();
  musicAudio.loop = true;
  musicAudio.volume = musicVolume;

  isMuted = localStorage.getItem(STORAGE_KEYS.muted) === "true";
  musicAudio.muted = isMuted;

  let savedSong = localStorage.getItem(STORAGE_KEYS.song);
  if (savedSong && SONG_PATHS[savedSong]) {
    currentSong = savedSong;
  }

  setupButtonListeners();
  updateButtonStates();

  document.addEventListener("click", handleOutsideClick);
}

// ── Abspielen ─────────────────────────────────────────────────────────────────

function playSong(songKey) {

  let isSameSong = currentSong === songKey;
  currentSong = songKey;

  musicAudio.src = SONG_PATHS[songKey];
  musicAudio.load();

  if (!isMuted) {
    musicAudio.play();
  }

  localStorage.setItem(STORAGE_KEYS.song, songKey);
  updateButtonStates();
}

// ── Mute ──────────────────────────────────────────────────────────────────────

function toggleMute() {
  isMuted = !isMuted;
  musicAudio.muted = isMuted;
  localStorage.setItem(STORAGE_KEYS.muted, isMuted);

  // Wenn unmuted und ein Song gewählt, aber Audio gestoppt → abspielen
  if (!isMuted && currentSong && musicAudio.paused) {
    musicAudio.play();
  }

  updateButtonStates();
}

// ── Menu Toggle ───────────────────────────────────────────────────────────────

function toggleMusicMenu() {
  let menu = document.getElementById("musicMenu");
  menu?.classList.toggle("active");
}

function handleOutsideClick(e) {
  let widget = document.querySelector(".music-widget");
  if (widget && !widget.contains(e.target)) {
    document.getElementById("musicMenu")?.classList.remove("active");
  }
}

// ── Button-Listener ───────────────────────────────────────────────────────────

function setupButtonListeners() {
  let buttons = {
    musicSong1: () => playSong("song1"),
    musicSong2: () => playSong("song2"),
    musicSong3: () => playSong("song3"),
    musicMute: () => toggleMute(),
  };

  for (let [id, handler] of Object.entries(buttons)) {
    document.getElementById(id)?.addEventListener("click", handler);
  }
}

// ── Button-Zustand aktualisieren ──────────────────────────────────────────────

function updateButtonStates() {
  // Song-Buttons: aktiven hervorheben
  ["song1", "song2", "song3"].forEach((key) => {
    let songNumber = key.replace("song", "");
    let btn = document.getElementById(`musicSong${songNumber}`);
    btn?.classList.toggle("active", currentSong === key);
  });

  // Mute-Button
  let muteBtn = document.getElementById("musicMute");
  if (muteBtn) {
    muteBtn.classList.toggle("muted", isMuted);
    muteBtn.innerHTML = isMuted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMusicPlayer);
} else {
  initMusicPlayer();
}

// Global für onclick="toggleMusicMenu()" im HTML
window.toggleMusicMenu = toggleMusicMenu;
