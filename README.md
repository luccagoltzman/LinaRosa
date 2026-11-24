# Lina Rosa · 85 anos

Convite digital para o aniversário de 85 anos de Lina Rosa — 14 de dezembro de 2026, 19h30, Terraço Morinda (São Luís – MA).

Página estática com animações em GSAP e rolagem suave com Lenis. A confirmação de presença é enviada pelo WhatsApp da família, já com a mensagem preenchida.

## Estrutura

```
index.html            Estrutura da página
assets/               Imagens (buquês) e favicon
css/
  base.css            Variáveis de cor e fonte, reset, utilitários
  components.css      Loader, florais, moldura, botões, navegação
  sections.css        Estilos de cada seção, na ordem da página
  responsive.css      Ajustes para tablet e celular
js/
  main.js             Ponto de entrada: inicializa tudo
  config.js           Dados do evento (data, WhatsApp, local) e utilitários
  animations.js       Loader, entrada do hero e efeitos de rolagem
  smooth-scroll.js    Rolagem suave (Lenis)
  split-text.js       Divide textos em letras para animar
  countdown.js        Contagem regressiva
  calendar.js         Botão "Salvar no celular" (.ics)
  rsvp.js             Formulário de confirmação de presença
  petals.js           Pétalas caindo e chuva de pétalas
```

Para mudar data, horário, local ou o número do WhatsApp, edite `js/config.js` (e os textos correspondentes no `index.html`).

## Rodando localmente

Os scripts usam módulos JavaScript, que não funcionam abrindo o arquivo direto. Rode um servidor nesta pasta:

```
python -m http.server
```

e acesse http://localhost:8000.
