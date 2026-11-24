// Animações com GSAP, inspiradas nos efeitos do site r-motors:
// loader com contador, letras que sobem, texto que "embaralha",
// parágrafo que acende na rolagem, parallax e navegação lateral.

import { $, $$ } from "./config.js";
import { splitText } from "./split-text.js";
import { getLenis, scrollToTop } from "./smooth-scroll.js";

// Mesmas curvas usadas no site.
function registerEases() {
  gsap.registerPlugin(ScrollTrigger, CustomEase, ScrambleTextPlugin);
  CustomEase.create("rm", "M0,0 C0.7,0.024 0.199,0.976 1,1 ");
}

/* ==========================================================================
   Estado inicial (antes do loader terminar)
   ========================================================================== */
function prepareHero() {
  const hero = {
    name: splitText($("[data-hero-name]")),
    age: splitText($("[data-hero-age]"), { mask: true }),
    ageText: splitText($("[data-hero-age2]"), { mask: true }),
    scramble: $$("[data-scramble]"),
  };

  gsap.set(hero.name, { yPercent: 70, opacity: 0, rotate: 10, filter: "blur(10px)" });
  gsap.set([...hero.age, ...hero.ageText], { yPercent: 110 });
  gsap.set(".hero .flora", { opacity: 0, scale: 1.08 });
  gsap.set(".scroll-cue", { opacity: 0, y: 20 });
  $$("[data-draw]").forEach(path => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });

  return hero;
}

/* ==========================================================================
   Loader: contador 0 → 85 e painéis subindo em ordem aleatória
   ========================================================================== */
function playLoader(onDone) {
  const counter = { value: 0 };
  const countEl = $(".loader-count");

  gsap.timeline({ delay: .2 })
    .to(counter, {
      value: 85,
      duration: 2.1,
      ease: "power4.inOut",
      onUpdate: () => (countEl.textContent = Math.round(counter.value)),
    }, 0)
    .to(".loader-bar i", { scaleX: 1, duration: 2.1, ease: "power4.inOut" }, 0)
    .add(scrollToTop)
    .to(".loader-inner", { yPercent: -30, opacity: 0, duration: .9, ease: "rm" }, "+=.25")
    .to(".loader-panel", { yPercent: -101, duration: 1.2, ease: "rm", stagger: { amount: .3, from: "random" } }, "-=.55")
    .add(() => {
      document.body.classList.remove("is-loading");
      onDone();
    }, "-=1.05")
    .add(() => $(".loader").remove());
}

/* ==========================================================================
   Entrada do hero
   ========================================================================== */
function playIntro(hero, onReady) {
  const [invite, hosts, hostsLine] = hero.scramble;
  const scramble = (el, chars, speed, revealDelay = 0) => ({
    scrambleText: { text: el.dataset.scramble, chars, speed, revealDelay },
  });

  gsap.timeline()
    .to(".hero .flora", { opacity: 1, scale: 1, duration: 2.2, ease: "expo.out", stagger: .15 }, 0)
    .to(hero.name, { yPercent: 0, opacity: 1, rotate: 0, filter: "blur(0px)", duration: 1.4, ease: "rm", stagger: .075, clearProps: "filter" }, .1)
    .to(hero.age, { yPercent: 0, duration: 1.1, ease: "rm", stagger: .09 }, .75)
    .to(hero.ageText, { yPercent: 0, duration: 1.1, ease: "rm", stagger: .06 }, .9)
    .to(invite, { duration: 1.2, ...scramble(invite, "lowerCase", .5, .2) }, .2)
    .to(hosts, { duration: 1.3, ...scramble(hosts, "lowerCase", .5, .3) }, 1.3)
    .to(hostsLine, { duration: 1.8, ...scramble(hostsLine, " ", .6) }, 1.9)
    .to("[data-draw]", { strokeDashoffset: 0, duration: 1.4, ease: "power3.inOut", stagger: .1 }, 2.3)
    .to(".scroll-cue", { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, 2.8)
    .add(onReady, 1.2);
}

/* ==========================================================================
   Efeitos ligados à rolagem
   ========================================================================== */
const onEnter = (trigger, start = "top 85%") => ({ trigger, start });

function heroExit(hero) {
  // Letras do nome sobem e giram ao sair, como no hero do site.
  gsap.fromTo(hero.name, { yPercent: 0, rotate: 0 }, {
    yPercent: -90, rotate: 8, opacity: 0, stagger: .05, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 20%", scrub: true },
  });
  gsap.to([".age", ".hero-hosts", ".ornament", ".hero .eyebrow"], {
    yPercent: -40, opacity: 0, stagger: .04, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "10% top", end: "bottom 30%", scrub: true },
  });
  gsap.to(".scroll-cue", {
    opacity: 0,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "15% top", scrub: true },
  });
}

function floralParallax() {
  $$("[data-flora]").forEach(flora => {
    const speed = parseFloat(flora.dataset.speed || 0);
    gsap.fromTo(flora,
      { y: () => -speed * innerHeight * .5 },
      {
        y: () => speed * innerHeight * .5,
        ease: "none",
        scrollTrigger: { trigger: flora.closest("section"), start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
  });
}

function tribute() {
  // Parágrafo que acende letra a letra.
  const chars = splitText($("[data-light]"));
  gsap.from(chars, {
    opacity: .16, stagger: .4, ease: "none",
    scrollTrigger: { trigger: ".tribute", start: "top 70%", end: "bottom 75%", scrub: .4 },
  });
  gsap.from(".tribute .eyebrow, .tribute-sign", {
    opacity: 0, y: 20, duration: 1, ease: "expo.out", stagger: .2,
    scrollTrigger: onEnter(".tribute", "top 70%"),
  });
}

function dateSection() {
  $$("[data-rise]").forEach((el, i) => {
    gsap.from(splitText(el, { mask: true }), {
      yPercent: 110, rotate: 6, duration: 1.3, ease: "rm", stagger: .06, delay: i * .12,
      scrollTrigger: onEnter(".date-big", "top 82%"),
    });
  });
  gsap.from(".date-big .dot", {
    scale: 0, duration: .8, ease: "back.out(3)", stagger: .15, delay: .5,
    scrollTrigger: onEnter(".date-big", "top 82%"),
  });
}

function placeSection() {
  $$("[data-rise-words]").forEach(el => {
    gsap.from(splitText(el, { mask: true }), {
      yPercent: 110, duration: 1.2, ease: "rm", stagger: .035,
      scrollTrigger: onEnter(el),
    });
  });

  // O arco com o buquê abre como uma cortina.
  const arch = "999px 999px 18px 18px";
  gsap.fromTo(".place-art",
    { clipPath: `inset(100% 0 0 0 round ${arch})` },
    { clipPath: `inset(0% 0 0 0 round ${arch})`, duration: 1.6, ease: "rm", scrollTrigger: onEnter(".place-art") });
}

function genericReveals() {
  $$("[data-reveal]").forEach(el => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: onEnter(el, "top 88%") });
  });
}

function finale() {
  gsap.from(splitText($("[data-finale-name]")), {
    yPercent: 80, opacity: 0, rotate: 10, filter: "blur(8px)", duration: 1.4, ease: "rm", stagger: .07, clearProps: "filter",
    scrollTrigger: onEnter(".finale", "top 65%"),
  });
  gsap.from([".finale .eyebrow", ".finale-sign"], {
    opacity: 0, y: 24, duration: 1.2, ease: "expo.out", stagger: .15, delay: .6,
    scrollTrigger: onEnter(".finale", "top 65%"),
  });
}

function sideNav() {
  const nav = $(".pnav");
  const indicator = $(".pnav-ind");
  const links = $$("[data-nav]");

  const setActive = id => {
    links.forEach(link => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", active);
      if (active) indicator.style.top = `${link.offsetTop}px`;
    });
  };

  $$("[data-sec]").forEach(section => {
    ScrollTrigger.create({
      trigger: section, start: "top 50%", end: "bottom 50%",
      onToggle: self => self.isActive && setActive(section.id),
    });
  });

  ScrollTrigger.create({
    trigger: ".hero", start: "bottom 70%", end: "max",
    onToggle: self => nav.classList.toggle("on", self.isActive),
  });
}

function floatingButton() {
  // Aparece depois do hero e some quando a seção de presença está na tela.
  const fab = $("[data-fab]");
  const rsvp = $("#presenca");
  const end = $(".finale");

  const update = () => {
    const pastHero = scrollY > innerHeight * .8;
    const rsvpTop = rsvp.getBoundingClientRect().top;
    const endTop = end.getBoundingClientRect().top;
    const nearRsvp = rsvpTop < innerHeight * .9 || endTop < innerHeight * .4;
    fab.classList.toggle("on", pastHero && !nearRsvp);
  };

  ScrollTrigger.create({ start: 0, end: "max", onUpdate: update });
  update();
}

function setupScrollEffects(hero) {
  heroExit(hero);
  floralParallax();
  tribute();
  dateSection();
  placeSection();
  genericReveals();
  finale();
  sideNav();
  floatingButton();
  ScrollTrigger.refresh();
}

/* ==========================================================================
   Ponto de entrada
   ========================================================================== */
export function initAnimations() {
  registerEases();
  const lenis = getLenis();
  lenis?.stop();

  const hero = prepareHero();
  scrollToTop();
  addEventListener("load", scrollToTop);

  playLoader(() =>
    playIntro(hero, () => {
      lenis?.start();
      setupScrollEffects(hero);
    })
  );
}

// Sem GSAP ou com "menos movimento": mostra tudo pronto, sem animação.
export function showStatic() {
  $$("[data-scramble]").forEach(el => (el.textContent = el.dataset.scramble));
  $(".loader")?.remove();
  document.body.classList.remove("is-loading");
}
