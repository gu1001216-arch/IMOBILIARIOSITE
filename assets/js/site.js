
/* Trava de rolagem do fundo compatível com toque.
   iOS ignora body{overflow:hidden}: o fundo continua rolando e o conteúdo
   do modal "prende". Aqui o corpo é fixado e o scroll devolvido ao final.
   A posição é rastreada continuamente enquanto o corpo está livre, o que
   sobrevive à sequência gaveta -> modal (destrava e trava de novo). */
var _travaY = 0, _travas = 0;
(function(){
  function registrar(){
    if(document.body.style.position !== 'fixed')
      _travaY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }
  window.addEventListener('scroll', registrar, {passive:true});
  document.addEventListener('DOMContentLoaded', registrar);
  registrar();
})();
function travarFundo(){
  _travas++;
  if(_travas > 1) return;
  var b = document.body;
  b.style.position='fixed'; b.style.top=(-_travaY)+'px';
  b.style.left='0'; b.style.right='0'; b.style.width='100%';
  b.style.overflow='hidden';
}
function destravarFundo(){
  _travas--;
  if(_travas > 0) return;
  _travas = 0;
  var y = _travaY, b = document.body;
  b.style.position=''; b.style.top=''; b.style.left='';
  b.style.right=''; b.style.width=''; b.style.overflow='';
  window.scrollTo(0, y);
}
function destravarFundo(){
  _travas--;
  if(_travas > 0) return;
  _travas = 0;
  var b = document.body;
  b.style.position=''; b.style.top=''; b.style.left='';
  b.style.right=''; b.style.width=''; b.style.overflow='';
  window.scrollTo(0, _travaY);
}
function destravarFundo(){
  if(!_travado) return;
  // se ainda houver modal ou gaveta abertos, mantém travado
  var m = document.getElementById('formModal');
  var g = document.querySelector('.gaveta');
  var aviso = document.getElementById('avisoEnvio');
  var aberto = (m && !m.hidden) || (g && g.classList.contains('on')) || aviso;
  if(aberto) return;
  var b = document.body;
  b.style.position=''; b.style.top=''; b.style.left='';
  b.style.right=''; b.style.width=''; b.style.overflow='';
  _travado = false;
  window.scrollTo(0, _travaY);
}
function destravarFundo(){
  _travas = Math.max(0, _travas - 1);
  if(_travas > 0) return;
  var b = document.body;
  b.style.position = '';
  b.style.top = '';
  b.style.left = '';
  b.style.right = '';
  b.style.width = '';
  b.style.overflow = '';
  window.scrollTo(0, _travaY);
}
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

  /* ── Mega menu desktop: mantém aberto durante a transição do mouse ── */
  var itensSub = document.querySelectorAll(".tem-sub");
  Array.prototype.forEach.call(itensSub, function (item) {
    var fecharTimer = null;
    function abrirSub() {
      if (window.innerWidth < 1040) return;
      if (fecharTimer) clearTimeout(fecharTimer);
      item.classList.add("menu-aberto");
    }
    function agendarFecho() {
      if (window.innerWidth < 1040) return;
      if (fecharTimer) clearTimeout(fecharTimer);
      fecharTimer = setTimeout(function () {
        item.classList.remove("menu-aberto");
      }, 280);
    }
    item.addEventListener("mouseenter", abrirSub);
    item.addEventListener("mouseleave", agendarFecho);
    item.addEventListener("focusin", abrirSub);
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) agendarFecho();
    });

    var link = item.querySelector(":scope > a");
    if (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth >= 1040) {
          item.classList.add("menu-aberto");
        }
      });
    }
  });

  /* ── Menu lateral ── */
  var btnMenu = document.getElementById("btnMenu");
  var gaveta = document.getElementById("gaveta");
  var veu = document.getElementById("veu");

  function abrirMenu() {
    if (!gaveta) return;
    gaveta.classList.add("aberta");
    if (veu) { veu.hidden = false; requestAnimationFrame(function () { veu.classList.add("ativo"); }); }
    if (btnMenu) btnMenu.setAttribute("aria-expanded", "true");
    travarFundo();
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
    if (!modalAberto()) destravarFundo();
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
    travarFundo();
    ev("formulario_abrir", { origem: origem || "" });
    var campo = modal.querySelector("input,select,textarea");
    if (campo) setTimeout(function () { campo.focus(); }, 160);
  }

  function fecharModal() {
    if (!modal) return;
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    setTimeout(function () { modal.hidden = true; }, 300);
    destravarFundo();
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
        notificarEnvio();
      })
      .catch(function () {
        status.className = "form-status erro";
        status.textContent = "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.";
      })
      .then(function () {
        if (botao) { botao.disabled = false; botao.textContent = botao.getAttribute("data-rotulo") || "Enviar minha solicitação"; }
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

/* Teste de hifenização em português.
   Justificar sem hifenização produz espaços desproporcionais entre as
   palavras. Só ativamos o justificado quando o navegador de fato hifeniza. */
(function(){
  try{
    var d=document.createElement('div');
    d.lang='pt-BR';
    d.style.cssText='position:absolute;left:-9999px;top:-9999px;width:80px;'+
      'font:16px serif;visibility:hidden;';
    d.textContent='regularização administrativa propriedade usucapião';
    document.documentElement.appendChild(d);
    var semHifen=d.offsetHeight;
    d.style.hyphens='auto'; d.style.webkitHyphens='auto'; d.style.msHyphens='auto';
    var comHifen=d.offsetHeight;
    document.documentElement.removeChild(d);
    if(comHifen<semHifen) document.documentElement.classList.add('hifen-ok');
  }catch(e){/* sem suporte: mantém alinhado à esquerda */}
})();

/* Rodapé fixo do modal: o botão de envio é o último item do grid, então
   position:sticky não tem área para deslizar. Movemos o bloco do botão
   para fora da região que rola, como rodapé do card. Assim ele fica
   sempre visível, inclusive em telas pequenas. */
(function(){
  function ancorarBotao(){
    var card=document.querySelector('#formModal .form-modal-card');
    if(!card || card.querySelector('.form-modal-foot')) return;
    var btn=card.querySelector('button[type="submit"]');
    if(!btn) return;
    var bloco=btn.closest('.campo-full') || btn.parentElement;
    var foot=document.createElement('div');
    foot.className='form-modal-foot';
    foot.appendChild(bloco);
    card.appendChild(foot);
    // o clique precisa continuar submetendo o formulário
    var form=card.querySelector('form');
    if(form && !btn.getAttribute('form') && form.id) btn.setAttribute('form', form.id);
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-open-form]')) setTimeout(ancorarBotao,30);
  });
  if(document.readyState!=='loading') ancorarBotao();
  else document.addEventListener('DOMContentLoaded',ancorarBotao);
})();


/* Notificação de envio: confirmação visível, centralizada, com foco
   acessível. O texto discreto abaixo do formulário passava despercebido,
   sobretudo no celular, onde o usuário já rolou a tela. */
function notificarEnvio(){
  var antigo=document.getElementById('avisoEnvio');
  if(antigo) antigo.remove();

  // fecha o modal antes de mostrar a confirmação, senão o aviso
  // fica atrás dele e o botão Fechar não recebe o clique
  var m=document.getElementById('formModal');
  if(m && !m.hidden){
    var x=m.querySelector('[data-close-form]');
    if(x) x.click(); else { m.hidden=true; m.setAttribute('aria-hidden','true'); }
  }

  var fundo=document.createElement('div');
  fundo.id='avisoEnvio';
  fundo.className='aviso-envio';
  fundo.setAttribute('role','alertdialog');
  fundo.setAttribute('aria-modal','true');
  fundo.setAttribute('aria-labelledby','avisoEnvioTitulo');

  fundo.innerHTML =
    '<div class="aviso-envio-card">' +
      '<div class="aviso-envio-icone" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
      '</div>' +
      '<h3 id="avisoEnvioTitulo">Mensagem enviada</h3>' +
      '<p>Recebemos suas informações. Você receberá um retorno em breve no contato informado.</p>' +
      '<button type="button" class="btn btn-mar" data-fechar-aviso>Fechar</button>' +
    '</div>';

  document.body.appendChild(fundo);
  var anterior=document.activeElement;
  var btn=fundo.querySelector('[data-fechar-aviso]');
  if(btn) btn.focus();

  function fechar(){
    fundo.remove();
    if(anterior && anterior.focus) anterior.focus();
    document.removeEventListener('keydown', aoTeclar);
  }
  function aoTeclar(e){ if(e.key==='Escape') fechar(); }

  fundo.addEventListener('click', function(e){
    if(e.target===fundo || e.target.closest('[data-fechar-aviso]')) fechar();
  });
  document.addEventListener('keydown', aoTeclar);
}
