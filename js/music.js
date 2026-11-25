// Música de fundo.
// A música tenta tocar sozinha quando o convite abre. A maioria dos navegadores
// (principalmente no celular) bloqueia som antes de um toque da pessoa; nesse
// caso ela começa no primeiro toque, clique ou tecla em qualquer lugar da página.
// Entra com volume suave, pausa quando o convite sai da tela e volta depois.

import { $, $$ } from "./config.js";

const VOLUME = .55;
const FADE_MS = 2500;

let audio = null;
let wantsPlaying = false; // a pessoa quer música (e não pausou)

function fadeTo(target, ms, done) {
  // No iPhone o volume é só leitura; nesse caso a música toca no volume do aparelho.
  const from = audio.volume;
  const start = performance.now();
  (function step(now) {
    const t = Math.min(1, (now - start) / ms);
    audio.volume = from + (target - from) * t;
    if (t < 1) requestAnimationFrame(step);
    else done?.();
  })(start);
}

function render() {
  const playing = !audio.paused;
  document.body.classList.toggle("music-on", playing);
  $$("[data-music-toggle]").forEach(btn => {
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute("aria-label", playing ? "Pausar música" : "Tocar música");
  });
  const state = $("[data-music-state]");
  if (state) state.textContent = playing ? "Tocando agora" : "Toque para ouvir";
}

export function playMusic() {
  if (!audio) return;
  wantsPlaying = true;
  audio.volume = 0;
  audio.play()
    .then(() => {
      disarmUnlock();
      fadeTo(VOLUME, FADE_MS);
    })
    .catch(armUnlock); // bloqueado: espera o primeiro toque
}

export function pauseMusic() {
  if (!audio) return;
  wantsPlaying = false;
  disarmUnlock();
  fadeTo(0, 400, () => audio.pause());
}

/* ---------- Começa no primeiro toque, se o navegador bloqueou ---------- */
// Eventos que os navegadores aceitam como "gesto" para liberar o som.
const UNLOCK_EVENTS = ["pointerdown", "touchend", "click", "keydown"];

function onFirstGesture(event) {
  // Um toque no próprio botão de som é tratado por ele.
  if (event.target.closest?.("[data-music-toggle]")) return;
  if (wantsPlaying && audio.paused) playMusic();
}

function armUnlock() {
  UNLOCK_EVENTS.forEach(evt => document.addEventListener(evt, onFirstGesture, { capture: true, passive: true }));
}

function disarmUnlock() {
  UNLOCK_EVENTS.forEach(evt => document.removeEventListener(evt, onFirstGesture, { capture: true }));
}

export function initMusic() {
  audio = $("#music");
  if (!audio) return;

  ["play", "pause"].forEach(evt => audio.addEventListener(evt, render));

  // Barra de progresso do player da seção de música.
  const bar = $("[data-music-progress]");
  audio.addEventListener("timeupdate", () => {
    if (bar && audio.duration) bar.style.transform = `scaleX(${audio.currentTime / audio.duration})`;
  });

  $$("[data-music-toggle]").forEach(btn => {
    btn.addEventListener("click", () => (audio.paused ? playMusic() : pauseMusic()));
  });

  // Pausa ao trocar de aba ou bloquear a tela; volta ao retornar.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (wantsPlaying) audio.play().catch(() => {});
  });

  render();
}
