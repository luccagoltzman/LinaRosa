// Contagem regressiva até a festa. Cada dígito que muda sobe com uma animação.

import { EVENT, hasGsap, reduceMotion, $$ } from "./config.js";

const pad = n => String(n).padStart(2, "0");

export function initCountdown() {
  const els = Object.fromEntries($$("[data-cd]").map(el => [el.dataset.cd, el]));
  const last = {};

  function render(key, value) {
    const el = els[key];
    if (!el || last[key] === value) return;

    const prev = last[key];
    last[key] = value;
    el.innerHTML = [...value].map(d => `<span>${d}</span>`).join("");

    if (!hasGsap || reduceMotion || prev === undefined) return;
    [...el.children].forEach((digit, i) => {
      if (prev[i] !== value[i]) {
        gsap.from(digit, { yPercent: 100, duration: .6, ease: "expo.out" });
      }
    });
  }

  function tick() {
    let ms = Math.max(0, EVENT.date - Date.now());
    const days = Math.floor(ms / 864e5);    ms -= days * 864e5;
    const hours = Math.floor(ms / 36e5);    ms -= hours * 36e5;
    const minutes = Math.floor(ms / 6e4);   ms -= minutes * 6e4;
    const seconds = Math.floor(ms / 1e3);

    render("d", pad(days));
    render("h", pad(hours));
    render("m", pad(minutes));
    render("s", pad(seconds));
  }

  tick();
  setInterval(tick, 1000);
}
