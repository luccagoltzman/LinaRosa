// Pétalas caindo no hero e a "chuva" de pétalas ao confirmar presença.

import { reduceMotion, $ } from "./config.js";

const COLORS = ["#e8b7ae", "#f0c9c1", "#dca39a", "#f6e3dc", "#c9d0b4"];
const dpr = () => Math.min(2, window.devicePixelRatio || 1);

function createPetal(width, height, anywhere) {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -20,
    r: 5 + Math.random() * 7,
    vx: -.2 + Math.random() * .4,
    vy: .25 + Math.random() * .55,
    a: Math.random() * Math.PI * 2,
    va: -.02 + Math.random() * .04,
    sway: Math.random() * Math.PI * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: .35 + Math.random() * .45,
  };
}

function drawPetal(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.a);
  ctx.scale(1, .55 + .45 * Math.sin(p.sway * 2)); // simula a pétala girando
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, -p.r);
  ctx.bezierCurveTo(p.r, -p.r * .6, p.r * .8, p.r * .7, 0, p.r);
  ctx.bezierCurveTo(-p.r * .8, p.r * .7, -p.r, -p.r * .6, 0, -p.r);
  ctx.fill();
  ctx.restore();
}

function fitCanvas(canvas, width, height) {
  const ratio = dpr();
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
}

/* ---------- Pétalas contínuas no hero ---------- */
export function initPetals() {
  const canvas = $("#petals");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let visible = true;

  const resize = () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    fitCanvas(canvas, width, height);
  };
  resize();
  addEventListener("resize", resize);

  const petals = Array.from({ length: width < 600 ? 14 : 26 }, () => createPetal(width, height, true));

  // Só desenha enquanto o hero estiver na tela.
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(canvas.parentElement);

  (function frame() {
    if (visible) {
      ctx.clearRect(0, 0, width, height);
      petals.forEach(p => {
        p.sway += .012;
        p.x += p.vx + Math.sin(p.sway) * .35;
        p.y += p.vy;
        p.a += p.va;
        if (p.y > height + 20) Object.assign(p, createPetal(width, height, false));
        drawPetal(ctx, p);
      });
    }
    requestAnimationFrame(frame);
  })();
}

/* ---------- Explosão de pétalas dentro de um elemento ---------- */
export function burstPetals(container) {
  if (reduceMotion) return;

  const { width, height } = container.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.className = "burst";
  container.appendChild(canvas);
  fitCanvas(canvas, width, height);
  const ctx = canvas.getContext("2d");

  const FRAMES = 140;
  const petals = Array.from({ length: 60 }, () => {
    const p = createPetal(width, height, false);
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    return { ...p, x: width / 2, y: height * .28, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3, alpha: .9 };
  });

  let frame = 0;
  (function step() {
    frame++;
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.vy += .09;   // gravidade
      p.vx *= .985;  // resistência do ar
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va * 4;
      p.sway += .05;
      p.alpha = Math.max(0, .9 - frame / FRAMES);
      drawPetal(ctx, p);
    });
    if (frame < FRAMES) requestAnimationFrame(step);
    else canvas.remove();
  })();
}
