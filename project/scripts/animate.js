import {
  animate,
  stagger,
} from "../node_modules/animejs/dist/modules/index.js";


// anime.js animation with help from
const splitIntoChars = (selector) => {
  const element = document.querySelector(selector);
  if (!element) return [];

  const text = element.textContent || "";
  const fragment = document.createDocumentFragment();
  const chars = [];

  for (const character of text) {
    const span = document.createElement("span");
    span.className = "quiz-char";
    span.textContent = character === " " ? "\u00A0" : character;
    fragment.append(span);
    chars.push(span);
  }

  element.textContent = "";
  element.append(fragment);
  return chars;
};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const welcomeChars = splitIntoChars(".hero-title");

  animate(welcomeChars, {
    opacity: [0, 1],
    y: [34, 0],
    scale: [0.84, 1],
    rotate: { from: -14 },
    delay: stagger(65, { from: "center", start: 120 }),
    duration: 760,
    ease: "outBack",
  });

  animate(welcomeChars, {
    color: ["#ffc0cb", "#"],
    duration: 980,
    delay: stagger(65, { from: "center", start: 330 }),
    ease: "inOutSine",
  });

  animate(".hero-brand", {
    opacity: [0, 1],
    y: [40, 0],
    rotate: { from: -8 },
    delay: 420,
    duration: 900,
    ease: "inOutQuint",
  });

  animate(".hero-logo", {
    opacity: [0, 1],
    y: [26, 0],
    scale: [0.88, 1],
    rotate: { from: 6 },
    duration: 1200,
    delay: 460,
    ease: "outElastic(1, .65)",
  });
}
