// Divide o texto de um elemento em palavras (.w) e letras (.c) para animar
// letra a letra. Com { mask: true }, cada letra fica dentro de uma máscara
// (.mask) e pode "subir" de dentro dela. Tags internas (ex.: <em>) são mantidas.

export function splitText(el, { mask = false } = {}) {
  const chars = [];

  const makeChar = ch => {
    const c = document.createElement("span");
    c.className = "c";
    c.textContent = ch;
    chars.push(c);
    if (!mask) return c;
    const m = document.createElement("span");
    m.className = "mask";
    m.appendChild(c);
    return m;
  };

  const walk = (source, target) => {
    source.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        walk(node, clone);
        target.appendChild(clone);
        return;
      }
      if (node.nodeType !== Node.TEXT_NODE) return;

      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          target.appendChild(document.createTextNode(" "));
          return;
        }
        const word = document.createElement("span");
        word.className = "w";
        [...part].forEach(ch => word.appendChild(makeChar(ch)));
        target.appendChild(word);
      });
    });
  };

  const out = document.createDocumentFragment();
  walk(el, out);
  el.replaceChildren(out);
  return chars;
}
