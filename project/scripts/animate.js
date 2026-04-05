
import {
  animate,
  stagger,
} from "../node_modules/animejs/dist/modules/index.js";

//animejs animation
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  animate(".hero-title, .hero-brand", {
    opacity: [0, 1],
    y: [40, 0],
    rotate: { from: -8 },
    delay: stagger(180),
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
