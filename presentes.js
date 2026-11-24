/* ============ CONFIG — edite aqui ============ */
const CONFIG = {
  chavePix: "becb4f6d-b217-46e2-9f7b-4509b4ecc9cb",
  nome: "Alice Teixeira da Rosa",   // máx. 25 caracteres (vira MAIÚSCULAS, sem acentos)
  cidade: "Porto Alegre"            // máx. 15 caracteres
};

/* ============ ITENS — edite textos e valores aqui ============ */
const ITENS = [
  { titulo: "Fundo de emergência para o carvão, gelo e sal grosso", descricao: "Seguro contra cerveja quente e churrasco sem fogo", valor: 100 },
  { titulo: "Panelinha para a Alice cozinhar o ovo cozido", descricao: "Agora que o fogão virou de indução, falta a panelinha certa para o ovo ficar no ponto", valor: 120 },
  { titulo: "Filamento para a impressora 3D do Hermann", descricao: "Combustível para ele imprimir tudo o que a casa ainda não sabia que precisava", valor: 150 },
  { titulo: "Tampão de ouvido anti-ronco para a Alice", descricao: "Investimento direto na paz e na qualidade do sono dela", valor: 150 },
  { titulo: "Mensalidade de volta ao treino funcional para o Hermann", descricao: "Para tirar a ferrugem de quem está parado e devolver ele para a ativa", valor: 180 },
  { titulo: "Massagem de liberação facial para a Alice", descricao: "Porque depois de sobreviver a uma reforma inteira, ela merece aliviar toda a tensão", valor: 200 },
  { titulo: "Alvará para o Hermann jogar no PC sem ser interrompido", descricao: "Válido por uma partida inteira (ou um fim de semana de jogatina)", valor: 220 },
  { titulo: "Diária de “Marido de Aluguel” para os últimos retoques do apê", descricao: "Para o Hermann não ter que resolver sozinho os pequenos detalhes que ficaram malfeitos na obra", valor: 250 },
  { titulo: "Fundo “Upgrade do Mestre-Cuca”", descricao: "Novos utensílios de cozinha para o Hermann continuar evoluindo nas receitas em casa", valor: 280 },
  { titulo: "Vale-compras / mimo livre para a Alice", descricao: "Sem perguntas, sem prestação de contas — só porque ela merece", valor: 300 },
  { titulo: "Primeiro jantar romântico de casados (sem precisar lavar louça)", descricao: "Para inaugurar a nova fase com dignidade", valor: 320 },
  { titulo: "Cota “Espaço extra para as pernas” no voo", descricao: "Para a viagem do ano que vem já começar sem aperto", valor: 350 },
  { titulo: "Jantar VIP na viagem (com direito a foto de agradecimento)", descricao: "Vocês patrocinam a noite, a gente manda selfie brindando", valor: 450 },
  { titulo: "Fundo de retoques finais da casa", descricao: "Para fechar com chave de ouro os últimos detalhes do nosso cantinho", valor: 500 },
  { titulo: "Patrocínio Oficial da Viagem dos Sonhos (Cota Master)", descricao: "Para quem quer garantir lugar cativo na primeira fila das histórias (e das fotos) das nossas férias", valor: 1000 }
];

/* ============ PIX (BR Code estático, EMV) ============ */
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) & 0xFF) << 8;
    for (let b = 0; b < 8; b++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id, value) {
  return id + String(value.length).padStart(2, "0") + value;
}

function limpar(texto, max) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim().slice(0, max).trim();
}

function gerarPix(valor, cfg) {
  cfg = cfg || CONFIG;
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", cfg.chavePix);
  const corpo =
    tlv("00", "01") +
    tlv("01", "11") +
    tlv("26", conta) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", Number(valor).toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", limpar(cfg.nome, 25)) +
    tlv("60", limpar(cfg.cidade, 15)) +
    tlv("62", tlv("05", "***")) +
    "6304";
  return corpo + crc16(corpo);
}

function formatarReal(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

/* ============ INTERFACE ============ */
if (typeof document !== "undefined") {
  // aviso(), el() e copiarTexto() vêm de site.js
  function copiar(texto) {
    copiarTexto(texto, "Pix copiado! Cole em Pix copia e cola no app do banco",
      "Não consegui copiar. Use o QR code ou selecione o código manualmente.");
  }

  const celular = !!(window.matchMedia && matchMedia("(pointer: coarse)").matches);

  // Um único botão "Quero esse". Ao clicar, abre o painel com Copiar Pix, QR code e a ajuda.
  // No celular copia o Pix na hora; no computador já mostra o QR code.
  // obterPayload() devolve o código Pix atual (ou null se o valor for inválido).
  function acoes(idBase, obterPayload) {
    const btnQuero = el("button", { type: "button", class: "btn-copy btn-quero", "aria-expanded": "false", "aria-controls": idBase + "-painel", text: "Quero esse" });
    const status = el("p", { class: "status", role: "status" });
    const qr = el("div", { class: "qr", hidden: "" });
    const btnCopy = el("button", { type: "button", class: "btn-copy", text: "Copiar Pix" });
    const btnQr = el("button", { type: "button", class: "btn-qr", "aria-expanded": "false", text: "Ver QR code" });
    const ajuda = el("div", { class: "ajuda" }, [
      el("h4", { text: "Como pagar" }),
      el("ol", {}, [
        el("li", { text: "Toque em Copiar Pix." }),
        el("li", { text: "Abra o app do seu banco." }),
        el("li", { text: "Escolha Pix → Pix copia e cola." }),
        el("li", { text: "Cole, confira o valor e o nome do recebedor (" + limpar(CONFIG.nome, 25) + ") e confirme." })
      ]),
      el("p", { text: "Está no computador? Escaneie o QR code com a câmera do celular ou pelo app do banco (Pix → Ler QR code)." })
    ]);
    const painel = el("div", { class: "painel", id: idBase + "-painel", hidden: "" }, [
      status, el("div", { class: "actions" }, [btnCopy, btnQr]), qr, ajuda
    ]);

    function mostrarQr(mostrar) {
      if (mostrar) { const p = obterPayload(); if (!p) return; desenharQr(qr, p); }
      qr.hidden = !mostrar;
      btnQr.setAttribute("aria-expanded", String(mostrar));
      btnQr.textContent = mostrar ? "Ocultar QR code" : "Ver QR code";
    }
    function fechar() {
      painel.hidden = true; mostrarQr(false); status.textContent = "";
      btnQuero.setAttribute("aria-expanded", "false"); btnQuero.textContent = "Quero esse";
    }
    btnQuero.addEventListener("click", () => {
      if (!painel.hidden) { fechar(); return; }
      const p = obterPayload();
      if (!p) return;
      painel.hidden = false;
      btnQuero.setAttribute("aria-expanded", "true");
      btnQuero.textContent = "Fechar";
      if (celular) {
        copiar(p);
        status.textContent = "Pix copiado! Agora abra o app do seu banco e use Pix → Pix copia e cola.";
      } else {
        mostrarQr(true);
        status.textContent = "Escaneie o QR code com o celular ou copie o código Pix.";
      }
      painel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    btnCopy.addEventListener("click", () => { const p = obterPayload(); if (p) copiar(p); });
    btnQr.addEventListener("click", () => mostrarQr(qr.hidden));
    return { botoes: btnQuero, painel, fechar };
  }

  function desenharQr(container, payload) {
    const q = qrcode(0, "M");
    q.addData(payload);
    q.make();
    container.innerHTML = q.createSvgTag({ scalable: true, margin: 0 });
    const svg = container.querySelector("svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "QR code do Pix");
    const nota = el("small", { text: "Escaneie com o app do banco (Pix → Ler QR code)" });
    container.appendChild(nota);
  }

  const raiz = document.getElementById("lista");
  const lista = el("section", { class: "list", "aria-label": "Presentes" });
  ITENS.forEach((it, n) => {
    const a = acoes("item" + (n + 1), () => gerarPix(it.valor));
    lista.appendChild(el("article", { class: "card" }, [
      el("h3", { text: it.titulo }),
      el("p", { text: it.descricao }),
      el("div", { class: "price", text: formatarReal(it.valor) }),
      el("div", { class: "actions" }, [a.botoes]), a.painel
    ]));
  });
  raiz.appendChild(lista);

  // Cartão "Outro valor"
  (function () {
    const input = el("input", { type: "text", id: "outro-valor", inputmode: "decimal", autocomplete: "off", placeholder: "0,00", "aria-describedby": "outro-erro" });
    const erro = el("p", { class: "error", id: "outro-erro", role: "alert" });
    let a;
    function valorValido() {
      const bruto = input.value.trim().replace(/\./g, "").replace(",", ".");
      const v = Number(bruto);
      if (!bruto || !isFinite(v) || v < 1 || v > 9999999.99) {
        erro.textContent = "Digite um valor de pelo menos R$ 1,00 (ex.: 75,50).";
        return null;
      }
      erro.textContent = "";
      return Math.round(v * 100) / 100;
    }
    a = acoes("outro", () => { const v = valorValido(); return v === null ? null : gerarPix(v); });
    // Se o valor mudar com o painel aberto, fecha (o código antigo não vale mais).
    input.addEventListener("input", () => a.fechar());
    const sec = el("section", { class: "list" }, [
      el("h2", { text: "Outro valor" }),
      el("article", { class: "card" }, [
        el("h3", { text: "Prefere escolher quanto dar?" }),
        el("p", { text: "Digite o valor e gere o Pix na hora. Mínimo de R$ 1,00." }),
        el("label", { for: "outro-valor", text: "Valor em R$" }),
        el("div", { class: "field" }, [el("span", { "aria-hidden": "true", text: "R$" }), input]),
        erro, el("div", { class: "actions" }, [a.botoes]), a.painel
      ])
    ]);
    raiz.appendChild(sec);
  })();
}
