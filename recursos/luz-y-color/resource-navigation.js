(() => {
  'use strict';
  const h5pdf = document.currentScript.dataset.resource === 'h5pdf';
  function mount() {
    const lang = document.documentElement.lang.slice(0, 2);
    const labels = {
      es: ['Recursos de DiCoSTEM-TT', 'Navegación entre recursos', 'Inicio', 'Test de las manzanas', 'Laboratorio de filtros', 'Test original', 'Hay una partida en curso. Si sales, perderás las respuestas. ¿Quieres continuar?'],
      pt: ['Recursos do DiCoSTEM-TT', 'Navegação entre recursos', 'Início', 'Teste das maçãs', 'Laboratório de filtros', 'Teste original', 'Há um teste em curso. Se saíres, perderás as respostas. Queres continuar?'],
      en: ['DiCoSTEM-TT resources', 'Resource navigation', 'Home', 'Apple test', 'Filter laboratory', 'Original test', 'A test is in progress. Leaving will discard your answers. Do you want to continue?']
    };
    const l = labels[lang] || labels.es;
    const code = labels[lang] ? lang : 'es';
    const suffix = code === 'es' ? '' : '-' + code;
    const nav = document.createElement('nav');
    nav.className = 'resource-navigation';
    nav.setAttribute('aria-label', l[1]);
    const catalog = `https://dicostem-tt.github.io/${code}/${code === 'en' ? 'resources' : 'recursos'}/`;
    const entries = [[catalog, l[0]]];
    if (!h5pdf) entries.push([code === 'es' ? 'index.html' : code + '.html', l[2]], ['manzanas' + suffix + '.html', l[3]], ['filtros' + suffix + '.html', l[4]], ['clasico' + suffix + '.html', l[5]]);
    const current = location.pathname.split('/').pop() || 'index.html';
    for (const [href, label] of entries) {
      const a = document.createElement('a');
      a.href = href; a.textContent = label;
      if (href === catalog) a.className = 'resource-catalog-link';
      else if (href === current) a.setAttribute('aria-current', 'page');
      nav.append(a);
    }
    document.querySelector('.site-header').insertAdjacentElement('afterend', nav);
    if (h5pdf) new MutationObserver(() => {
      const code = document.documentElement.lang.slice(0, 2);
      const text = labels[code] || labels.es;
      nav.setAttribute('aria-label', text[1]);
      nav.firstElementChild.textContent = text[0];
      nav.firstElementChild.href = `https://dicostem-tt.github.io/${labels[code] ? code : 'es'}/${code === 'en' ? 'resources' : 'recursos'}/`;
    }).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
    let approvedExit = false;
    const ongoing = () => !!document.querySelector('#one-question') || !!(document.querySelector('#quiz input:checked') && document.querySelector('#result[hidden]'));
    document.addEventListener('click', event => {
      const a = event.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const next = new URL(a.href, location.href);
      if (next.origin === location.origin && next.pathname === location.pathname && next.search === location.search) return;
      if (ongoing()) {
        if (!window.confirm(l[6])) { event.preventDefault(); event.stopImmediatePropagation(); }
        else approvedExit = true;
      }
    }, true);
    window.addEventListener('beforeunload', event => { if (!approvedExit && ongoing()) { event.preventDefault(); event.returnValue = ''; } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
})();
