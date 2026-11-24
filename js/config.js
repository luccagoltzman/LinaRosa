// Dados do evento e utilitários compartilhados entre os módulos.

export const EVENT = {
  date: new Date("2026-12-14T19:30:00-03:00"),
  whatsapp: "5598988220451",
  summary: "Aniversário de 85 anos — Lina Rosa",
  location: "Terraço Morinda, Avenida Avicênia, 17, Calhau, São Luís - MA",
  description: "Niedja, Gabriela e Fernanda convidam para celebrar a vida de sua querida mãe.",
  startUtc: "20261214T223000Z",
  endUtc: "20261215T023000Z",
  footer: "14/12/2026 · 19h30 · Terraço Morinda",
};

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// GSAP é carregado por <script> comum antes dos módulos.
export const hasGsap = typeof window.gsap !== "undefined";

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
