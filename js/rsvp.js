// Formulário de confirmação de presença.
// Monta a mensagem e abre o WhatsApp da família já com o texto preenchido.
// O convite é nominal (quem vai está no próprio convite), então o formulário
// pede só o nome, a resposta e um recado opcional.

import { EVENT, hasGsap, reduceMotion, $ } from "./config.js";
import { burstPetals } from "./petals.js";
import { refreshLayout } from "./smooth-scroll.js";

const STORAGE_KEY = "lina85-rsvp";

export function initRsvp() {
  const form = $("#rsvp-form");
  if (!form) return;

  const card = $(".card");
  const thanks = $("[data-thanks]");
  const nameField = $('[data-field="nome"]');

  const isGoing = () => form.vai.value === "sim";

  /* ---------- Mensagem do WhatsApp ---------- */
  function buildMessage(d) {
    const lines = [
      d.going
        ? "Olá! 🌸 Confirmo presença no aniversário de 85 anos da Lina Rosa."
        : "Olá! 🌸 Infelizmente não poderei ir ao aniversário de 85 anos da Lina Rosa.",
      "",
      `*Nome:* ${d.name}`,
    ];
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
      ? `Seu lugar já está reservado com carinho. ${retry} para enviar a confirmação.`
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

  $("[data-again]").addEventListener("click", () => {
    thanks.classList.remove("show");
    form.hidden = false;
    refreshLayout();
  });

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

    const data = { name, going: isGoing(), note: form.recado.value.trim() };
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
      form.recado.value = saved.note || "";
      form.vai.value = saved.going ? "sim" : "nao";
    } catch (_) { /* armazenamento indisponível */ }
  }

  restore();
}
