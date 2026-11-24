/* Código compartilhado entre as páginas: navegação, aviso rápido e copiar para a área de transferência. */
(function () {
  const MENU = [
    ["Convite", "index.html#convite"],
    ["Local e horários", "index.html#local"],
    ["Traje", "index.html#traje"],
    ["Presentes", "index.html#presentes"]
  ];

  window.el = function (tag, attrs, children) {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => k === "text" ? e.textContent = v : e.setAttribute(k, v));
    (children || []).forEach(c => e.appendChild(c));
    return e;
  };

  let toastEl, toastTimer;
  window.aviso = function (msg) {
    if (!toastEl) {
      toastEl = el("div", { id: "toast", role: "status", "aria-live": "polite" });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3500);
  };

  // navigator.clipboard com fallback (textarea + execCommand) para navegadores que bloqueiam.
  window.copiarTexto = function (texto, msgOk, msgErro) {
    const ok = () => aviso(msgOk);
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = texto; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, texto.length);
      let sucesso = false;
      try { sucesso = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      sucesso ? ok() : aviso(msgErro || "Não consegui copiar. Selecione o texto manualmente.");
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(ok, fallback);
    } else fallback();
  };

  function montarMenu() {
    const topo = document.getElementById("topo");
    if (!topo) return;
    const pagina = location.pathname.split("/").pop() || "index.html";
    const ul = el("ul");
    MENU.forEach(([rotulo, href]) => {
      const a = el("a", { href, text: rotulo });
      if (href === pagina) a.setAttribute("aria-current", "page");
      ul.appendChild(el("li", {}, [a]));
    });
    const nav = el("nav", { id: "menu", "aria-label": "Principal" }, [ul]);
    const btn = el("button", { type: "button", class: "menu-btn", "aria-expanded": "false", "aria-controls": "menu", text: "Menu" });
    const mq = window.matchMedia("(min-width: 640px)");
    const ajustar = () => { nav.hidden = !mq.matches && btn.getAttribute("aria-expanded") !== "true"; };
    btn.addEventListener("click", () => {
      btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true"));
      ajustar();
    });
    nav.addEventListener("click", e => {
      if (e.target.closest("a")) { btn.setAttribute("aria-expanded", "false"); ajustar(); }
    });
    mq.addEventListener ? mq.addEventListener("change", ajustar) : mq.addListener(ajustar);
    const marca = el("a", { class: "marca", href: "index.html", "aria-label": "Início" }, [
      el("img", { src: "logo.jpg", width: "44", height: "44", alt: "" }),
      el("span", { text: (typeof EVENT !== "undefined" && EVENT.noivos) || "" })
    ]);
    topo.appendChild(el("div", { class: "topo-in" }, [marca, btn, nav]));
    ajustar();
  }

  document.addEventListener("DOMContentLoaded", montarMenu);
})();
