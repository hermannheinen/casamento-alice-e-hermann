# casamento-alice-e-hermann

Lista de presentes de casamento de Alice & Hermann: uma página estática (um único `index.html`, sem build, sem framework, sem backend). Cada item gera um Pix "copia e cola" (BR Code estático) com o valor já preenchido, mais o QR code correspondente. Tudo é gerado no navegador; nada é enviado a servidor algum, e não há analytics nem cookies.

## Estrutura

- `index.html` — página, CONFIG, lista de itens (`ITENS`) e geração do Pix
- `fonts/montserrat-latin.woff2` — Montserrat (SIL OFL 1.1), hospedada localmente, sem chamadas ao Google Fonts
- `logo.jpg` — monograma (versão reduzida do arquivo original)
- `fonts/dmserifdisplay-latin.woff2` — DM Serif Display (SIL OFL 1.1), títulos
- `qrcode.js` — [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4, © Kazuhiko Arase, licença MIT
- `test/pix.test.js` — testes do CRC16 e do payload

## Editar

No `<script>` do `index.html`:

- `CONFIG`: chave Pix, nome do recebedor (máx. 25) e cidade (máx. 15).
- `ITENS`: textos e valores dos itens (array de objetos, separado da renderização).

## Testar localmente

Abra o `index.html` no navegador (duplo clique) ou rode `python3 -m http.server` e acesse http://localhost:8000. O botão de copiar usa `navigator.clipboard` com fallback para `execCommand`.

Testes automatizados (Node, sem dependências):

```sh
node test/pix.test.js
```

> A validação final é abrir um código no app do banco e conferir valor e nome do recebedor, **sem confirmar o pagamento**.

## Publicar no GitHub Pages

1. Crie um repositório **público** chamado `casamento-alice-e-hermann` no GitHub.
2. Suba os arquivos (`git remote add origin <url>` e `git push -u origin main`).
3. Em **Settings → Pages → Build and deployment → Deploy from a branch**, escolha **main** / **(root)** e salve.
4. Após alguns minutos, a página estará em `https://SEU-USUARIO.github.io/casamento-alice-e-hermann/`.
