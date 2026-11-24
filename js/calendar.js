// Botão "Salvar no celular": gera um arquivo .ics com lembrete 1 dia antes.

import { EVENT, $ } from "./config.js";

// Vírgulas e ponto e vírgula precisam ser escapados no formato iCalendar.
const esc = text => text.replace(/([,;])/g, "\\$1");

function buildIcs() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lina Rosa 85//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:lina-rosa-85-20261214@convite",
    "DTSTAMP:20261101T120000Z",
    `DTSTART:${EVENT.startUtc}`,
    `DTEND:${EVENT.endUtc}`,
    `SUMMARY:${esc(EVENT.summary)}`,
    `LOCATION:${esc(EVENT.location)}`,
    `DESCRIPTION:${esc(EVENT.description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Amanhã: 85 anos da Lina Rosa",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function download(content, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 500);
}

export function initCalendar() {
  $("[data-ics]")?.addEventListener("click", () => download(buildIcs(), "Lina-Rosa-85-anos.ics"));
}
