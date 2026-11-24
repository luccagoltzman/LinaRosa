// Formulário de confirmação de presença.
// Monta a mensagem e abre o WhatsApp da família já com o texto preenchido.

import { EVENT, hasGsap, reduceMotion, $, $$ } from "./config.js";
import { burstPetals } from "./petals.js";
import { refreshLayout } from "./smooth-scroll.js";

const STORAGE_KEY = "lina85-rsvp";
const MAX_GUESTS = 15;

export function initRsvp() {
  const form = $("#rsvp-form");
  if (!form) return;

  const card = $(".card");
  const thanks = $("[data-thanks]");
  const guests = $("[data-guests]");
  const nameField = $('[data-field="nome"]');
  const qtdOut = $("#qtd");
  const qtdTxt = $("[data-qtd-txt]");
  let qtd = 1;

  /* ---------- Quantidade de pessoas ---------- */
  function setQtd(value, direction = 0) {
    qtd = Math.min(MAX_GUESTS, Math.max(1, value));
    qtdOut.textContent = qtd;
    qtdTxt.textContent = qtd === 1 ? "pessoa" : "pessoas";
    if (direction && hasGsap && !reduceMotion) {
      gsap.fromTo(qtdOut, { yPercent: 40 * direction, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, ease: "expo.out" });
    }
  }

  $$("[data-step]", form).forEach(button => {
    const step = Number(button.dataset.step);
    button.addEventListener("click", () => setQtd(qtd + step, Math.sign(step)));
  });

  /* ---------- Mostra/esconde os campos de acompanhantes ---------- */
  const isGoing = () => form.vai.value === "sim";

  function syncGuests() {
    const yes = isGoing();
    guests.style.height = yes ? `${guests.scrollHeight}px` : "0px";
    guests.style.opacity = yes ? 1 : 0;
    guests.setAttribute("aria-hidden", String(!yes));
    $$("button, input", guests).forEach(el => (el.tabIndex = yes ? 0 : -1));
    setTimeout(refreshLayout, 650);
  }

  $$('input[name="vai"]', form).forEach(radio => radio.addEventListener("change", syncGuests));
  addEventListener("resize", () => {
    if (!isGoing()) return;
    guests.style.height = "auto";
    guests.style.height = `${guests.scrollHeight}px`;
  });

  /* ---------- Mensagem do WhatsApp ---------- */
  function buildMessage(d) {
    const lines = d.going
      ? ["Olá! 🌸 Confirmo presença no aniversário de 85 anos da Lina Rosa.", "", `*Nome:* ${d.name}`, `*Pessoas:* ${d.qtd}`]
      : ["Olá! 🌸 Infelizmente não poderei ir ao aniversário de 85 anos da Lina Rosa.", "", `*Nome:* ${d.name}`];

    if (d.going && d.companions) lines.push(`*Acompanhantes:* ${d.companions}`);
    if (d.note) lines.push("", `*Recado para a Lina:* ${d.note}`);
    lines.push("", EVENT.footer);
    return lines.join("\n");
  }

  const whatsappUrl = text => `https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ---------- Tela de agradecimento ---------- */
  function showThanks(d, url) {
    const firstName = d.name.split(/\s+/)[0];
    const retry = "Se o WhatsApp não abriu, toque no botão abaixo";

    $("[data-thanks-title]").textContent = d.going ? `Até lá, ${firstName}!` : `Obrigado, ${firstName}`;
    $("[data-thanks-msg]").textContent = d.going
      ? `Reservamos um lugar especial para ${d.qtd > 1 ? `vocês ${d.qtd}` : "você"}. ${retry} para enviar a confirmação.`
      : `Sentiremos sua falta. Seu carinho chegará até ela. ${retry}.`;
    $("[data-thanks-wa]").href = url;

    form.hidden = true;
    thanks.classList.add("show");
    refreshLayout();

    if (hasGsap && !reduceMotion) {
      gsap.from(thanks.children, { y: 30, opacity: 0, stagger: .08, duration: 1, ease: "expo.out" });
      burstPetals(card);
    }
  }

  function hideThanks() {
    thanks.classList.remove("show");
    form.hidden = false;
    syncGuests();
    refreshLayout();
  }

  $("[data-again]").addEventListener("click", hideThanks);

  /* ---------- Envio ---------- */
  form.nome.addEventListener("input", () => nameField.classList.remove("invalid"));

  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = form.nome.value.trim();
    if (name.length < 2) {
      nameField.classList.add("invalid");
      form.nome.focus();
      return;
    }

    const data = {
      name,
      going: isGoing(),
      qtd,
      companions: form.acomp.value.trim(),
      note: form.recado.value.trim(),
    };
    const url = whatsappUrl(buildMessage(data));

    window.open(url, "_blank", "noopener");
    save(data);
    showThanks(data, url);
  });

  /* ---------- Lembra a resposta neste aparelho ---------- */
  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) { /* modo privado */ }
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved?.name) return;
      form.nome.value = saved.name;
      form.acomp.value = saved.companions || "";
      form.recado.value = saved.note || "";
      form.vai.value = saved.going ? "sim" : "nao";
      setQtd(saved.qtd || 1);
    } catch (_) { /* armazenamento indisponível */ }
  }

  restore();
  syncGuests();
}
