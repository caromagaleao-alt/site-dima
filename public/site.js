// Menu do celular
(function () {
  var b = document.querySelector('.menu-botao'), m = document.getElementById('menu-principal');
  if (!b || !m) return;
  b.addEventListener('click', function () {
    var aberto = m.classList.toggle('aberto');
    b.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });
  m.addEventListener('click', function (e) { if (e.target.tagName === 'A') { m.classList.remove('aberto'); b.setAttribute('aria-expanded', 'false'); } });
})();
// Formulário de avaliação: monta a mensagem e abre a conversa no WhatsApp da DIMA.
(function () {
  var form = document.getElementById('form-avaliacao');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
    var linhas = ['Olá! Vim pelo site e quero solicitar uma avaliação.'];
    if (v('nome')) linhas.push('Nome: ' + v('nome'));
    if (v('whatsapp')) linhas.push('WhatsApp: ' + v('whatsapp'));
    if (v('servico')) linhas.push('Serviço: ' + v('servico'));
    if (v('mensagem')) linhas.push('Sobre o local: ' + v('mensagem'));
    window.open('https://wa.me/5531991278633?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
  });
})();
// Medição: conta cliques no WhatsApp e no e-mail como contato (Google Analytics).
(function () {
  function ev(nome, params) { if (typeof gtag === 'function') gtag('event', nome, params); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (/wa\.me|api\.whatsapp/.test(h)) ev('generate_lead', { method: 'whatsapp', link_text: (a.innerText || '').trim().slice(0, 60), page_path: location.pathname });
    else if (/^mailto:/.test(h)) ev('generate_lead', { method: 'email', page_path: location.pathname });
    else if (/youtube\.com/.test(h)) ev('clique_youtube', { page_path: location.pathname });
    else if (/limpezadealtonivel/.test(h)) ev('clique_mentoria', { page_path: location.pathname });
  }, true);
  var form = document.getElementById('form-avaliacao');
  if (form) form.addEventListener('submit', function () {
    var s = form.elements['servico']; ev('generate_lead', { method: 'formulario', servico: s ? s.value : '', page_path: location.pathname });
  });
})();
