// Teste sem dependências: node test/pix.test.js
// Carrega o <script> real do index.html (sem DOM), então testa o mesmo código que roda no navegador.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.strictEqual(scripts.length, 1, "esperava 1 script inline");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(scripts[0] + "\n;this.api={CONFIG,ITENS,crc16,gerarPix,limpar};", ctx);
const { CONFIG, ITENS, crc16, gerarPix, limpar } = ctx.api;

let ok = 0;
const check = (cond, msg) => { assert.ok(cond, msg); ok++; };

// 1) Vetor conhecido CRC16-CCITT-FALSE
check(crc16("123456789") === "29B1", "CRC16 de 123456789 deve ser 29B1");

// Parser TLV estrito: valida tamanhos e devolve mapa
function parse(s) {
  const out = {}; let i = 0;
  while (i < s.length) {
    const id = s.slice(i, i + 2), len = s.slice(i + 2, i + 4);
    check(/^\d{2}$/.test(id) && /^\d{2}$/.test(len), `cabeçalho TLV inválido em ${i}`);
    const val = s.slice(i + 4, i + 4 + Number(len));
    check(val.length === Number(len), `tamanho do campo ${id} não bate`);
    out[id] = val; i += 4 + Number(len);
  }
  return out;
}

const nomeEsp = limpar(CONFIG.nome, 25), cidEsp = limpar(CONFIG.cidade, 15);
check(nomeEsp === "ALICE TEIXEIRA DA ROSA" && nomeEsp.length <= 25, "nome");
check(cidEsp === "PORTO ALEGRE" && cidEsp.length <= 15, "cidade");
check(limpar("José Conceição Ñandú", 25) === "JOSE CONCEICAO NANDU", "remoção de acentos");

const valores = ITENS.map(i => i.valor).concat([1, 75.5, 1234.56]);
check(ITENS.length === 16, "16 itens");

for (const v of valores) {
  const p = gerarPix(v);
  const f = parse(p);
  check(f["00"] === "01" && f["01"] === "11", "00/01");
  const conta = parse(f["26"]);
  check(conta["00"] === "br.gov.bcb.pix" && conta["01"] === CONFIG.chavePix, "campo 26");
  check(f["52"] === "0000" && f["53"] === "986" && f["58"] === "BR", "52/53/58");
  check(f["54"] === v.toFixed(2) && /^\d+\.\d{2}$/.test(f["54"]), `valor ${v}`);
  check(f["59"] === nomeEsp && f["60"] === cidEsp, "59/60");
  check(parse(f["62"])["05"] === "***", "campo 62");
  check(p.slice(-8, -4) === "6304", "CRC é o último campo");
  check(/^[0-9A-F]{4}$/.test(f["63"]) && f["63"] === crc16(p.slice(0, -4)), `CRC de ${v}`);
}

const exemplo = gerarPix(80);
console.log("Exemplo R$ 80,00:\n" + exemplo);
console.log(`\nOK — ${ok} verificações passaram.`);
