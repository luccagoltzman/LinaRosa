// Ponto de entrada do convite.

import { hasGsap, reduceMotion } from "./config.js";
import { initCountdown } from "./countdown.js";
import { initCalendar } from "./calendar.js";
import { initPetals } from "./petals.js";
import { initRsvp } from "./rsvp.js";
import { initMusic } from "./music.js";
import { initSmoothScroll, scrollToTop } from "./smooth-scroll.js";
import { initAnimations, showStatic } from "./animations.js";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollToTop();

initCountdown();
initCalendar();
initRsvp();
initPetals();
initMusic();

if (hasGsap && !reduceMotion) {
  initSmoothScroll();
  initAnimations();
} else {
  showStatic();
}
