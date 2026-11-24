// Rolagem suave com Lenis, integrada ao ScrollTrigger do GSAP.

import { $, $$ } from "./config.js";

let lenis = null;

export function initSmoothScroll() {
  if (typeof window.Lenis === "undefined") return null;

  lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Links internos (#data, #presenca...) deslizam suavemente.
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = $(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.8 });
    });
  });

  return lenis;
}

export const getLenis = () => lenis;

// Volta ao topo ao abrir o convite (o navegador às vezes restaura a posição).
export function scrollToTop() {
  if (location.hash) return;
  window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true, force: true });
}

// Recalcula alturas depois que o conteúdo muda de tamanho.
export function refreshLayout() {
  if (typeof window.ScrollTrigger === "undefined") return;
  requestAnimationFrame(() => {
    lenis?.resize();
    ScrollTrigger.refresh();
  });
}
