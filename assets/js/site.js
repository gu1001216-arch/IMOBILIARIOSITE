/* Vaccari Advocacia — comportamento compartilhado
   Menu lateral, mega menu, modal de contato, envio do formulário e eventos GA4. */
(function () {
  "use strict";

  var DESTINO = ["gustavoparisvaccari", "gmail.com"].join("@");
  var ENDPOINT = "https://formsubmit.co/ajax/" + DESTINO;

  /* ── Eventos de conversão ── */
  function ev(nome, dados) {
    var d = Object.assign({ pagina: location.pathname }, dados || {});
    var area = document.body.getAttribute("data-area");
    if (area) d.area = area;
    if (typeof window.gtag === "function") window.gtag("event", nome, d);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: nome }, d));
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-cta]") : null;
    if (!el) return;
    var href = el.getAttribute("href") || "";
    ev("cta_clique", { cta: el.getAttribute("data-cta"), destino: href });
    if (href.indexOf("wa.me") > -1) ev("contato_whatsapp", { origem: el.getAttribute("data-cta") });
  });

  /* ── Cabeçalho ── */
  var cab = document.querySelector(".cab");
  function aoRolar() {
    if (cab) cab.classList.toggle("desceu", window.scrollY > 40);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* ── Menu lateral ── */
  var btnMenu = document.getElementById("btnMenu");
  var gaveta = document.getElementById("gaveta");
  var veu = document.getElementById("veu");

  function abrirMenu() {
    if (!gaveta) return;
    gaveta.classList.add("aberta");
    if (veu) { veu.hidden = false; requestAnimationFrame(function () { veu.classList.add("ativo"); }); }
    if (btnMenu) btnMenu.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var a = gaveta.querySelector("a");
    if (a) setTimeout(function () { a.focus(); }, 120);
  }

  function fecharMenu() {
    if (!gaveta) return;
    gaveta.classList.remove("aberta");
    if (veu) {
      veu.classList.remove("ativo");
      setTimeout(function () { veu.hidden = true; }, 350);
    }
    if (btnMenu) btnMenu.setAttribute("aria-expanded", "false");
    if (!modalAberto()) document.body.style.overflow = "";
  }

  if (btnMenu) btnMenu.addEventListener("click", abrirMenu);
  if (veu) veu.addEventListener("click", fecharMenu);
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-fechar]")) fecharMenu();
    if (gaveta && gaveta.classList.contains("aberta") && e.target.closest && e.target.closest(".gaveta a")) fecharMenu();
  });

  /* ── Modal de contato ── */
  var modal = document.getElementById("formModal");
  var ultimoFoco = null;

  function modalAberto() {
    return modal && !modal.hidden;
  }

  function abrirModal(origem) {
    if (!modal) return;
    ultimoFoco = document.activeElement;
    fecharMenu();
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () { modal.classList.add("aberto"); });
    document.body.style.overflow = "hidden";
    ev("formulario_abrir", { origem: origem || "" });
    var campo = modal.querySelector("input,select,textarea");
    if (campo) setTimeout(function () { campo.focus(); }, 160);
  }

  function fecharModal() {
    if (!modal) return;
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    setTimeout(function () { modal.hidden = true; }, 300);
    document.body.style.overflow = "";
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  document.addEventListener("click", function (e) {
    var abre = e.target.closest ? e.target.closest("[data-open-form]") : null;
    if (abre) {
      e.preventDefault();
      var pre = abre.getAttribute("data-form-assunto") || document.body.getAttribute("data-assunto");
      if (pre && modal) {
        var sel = modal.querySelector('select[name="Situação"]');
        if (sel) {
          Array.prototype.forEach.call(sel.options, function (o) {
            if (o.textContent.trim() === pre) sel.value = o.value || o.textContent;
          });
        }
      }
      abrirModal(abre.getAttribute("data-open-form"));
      return;
    }
    if (e.target.closest && e.target.closest("[data-close-form]")) { fecharModal(); return; }
    if (modalAberto() && e.target === modal) fecharModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modalAberto()) fecharModal();
    else fecharMenu();
  });

  /* Foco preso dentro do modal */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !modalAberto()) return;
    var fs = modal.querySelectorAll('a[href],button:not([disabled]),input,select,textarea');
    if (!fs.length) return;
    var pri = fs[0], ult = fs[fs.length - 1];
    if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
    else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
  });

  /* ── Envio dos formulários ── */
  function statusDe(form) {
    var s = form.querySelector(".form-status");
    if (!s) {
      s = document.createElement("p");
      s.className = "form-status";
      s.setAttribute("role", "status");
      s.setAttribute("aria-live", "polite");
      form.appendChild(s);
    }
    return s;
  }

  function enviar(form) {
    var status = statusDe(form);
    var botao = form.querySelector('button[type="submit"]');
    var dados = {};
    new FormData(form).forEach(function (v, k) { dados[k] = v; });

    var tel = (dados["Telefone"] || "").trim();
    var mail = (dados["E-mail"] || "").trim();
    var nome = (dados["Nome"] || "").trim();

    if (!nome) {
      status.className = "form-status erro";
      status.textContent = "Informe seu nome para que possamos retornar.";
      var cn = form.querySelector('input[name="Nome"]');
      if (cn) cn.focus();
      return;
    }
    if (!tel && !mail) {
      status.className = "form-status erro";
      status.textContent = "Informe pelo menos um contato: telefone/WhatsApp ou e-mail.";
      var ct = form.querySelector('input[name="Telefone"]');
      if (ct) ct.focus();
      return;
    }
    if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail)) {
      status.className = "form-status erro";
      status.textContent = "Verifique o endereço de e-mail informado.";
      form.querySelector('input[name="E-mail"]').focus();
      return;
    }

    dados._subject = "Novo contato pelo site — " + nome;
    dados._template = "table";
    dados._captcha = "false";
    dados["Página de origem"] = location.pathname;

    if (botao) { botao.disabled = true; botao.setAttribute("data-rotulo", botao.textContent); botao.textContent = "Enviando…"; }
    status.className = "form-status";
    status.textContent = "Enviando suas informações…";

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(dados)
    })
      .then(function (r) { if (!r.ok) throw new Error("falha"); return r.json(); })
      .then(function () {
        form.reset();
        status.className = "form-status ok";
        status.textContent = "Mensagem enviada. Você receberá um retorno em breve.";
        ev("formulario_envio", { situacao: dados["Situação"] || "", origem: form.id || "" });
      })
      .catch(function () {
        status.className = "form-status erro";
        status.textContent = "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.";
      })
      .then(function () {
        if (botao) { botao.disabled = false; botao.textContent = botao.getAttribute("data-rotulo") || "Enviar mensagem"; }
      });
  }

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains("form")) return;
    e.preventDefault();
    enviar(form);
  });

  /* Pré-seleciona a situação conforme a página */
  var assunto = document.body.getAttribute("data-assunto");
  if (assunto) {
    Array.prototype.forEach.call(document.querySelectorAll('select[name="Situação"]'), function (sel) {
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.textContent.trim() === assunto) sel.value = o.value || o.textContent;
      });
    });
  }
})();
