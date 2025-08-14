// Requires lunr from CDN
async function initSearch() {
  const lang = document.documentElement.lang || 'es';
  const idxData = await fetch('/search.json').then(r => r.json());
  const docs = idxData.docs.filter(d => d.lang === lang);
  const idx = lunr(function () {
    this.ref('url');
    this.field('title');
    this.field('content');
    this.metadataWhitelist = ['position'];
    docs.forEach(d => this.add(d), this);
  });
  const input = document.getElementById('search-input');
  const out = document.getElementById('search-results');
  if (!input || !out) return;
  function render(res) {
    out.innerHTML = '';
    if (!res.length) { out.innerHTML = '<p>No se han encontrado resultados.</p>'; return; }
    res.slice(0, 40).forEach(hit => {
      const doc = docs.find(d => d.url === hit.ref);
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<a href="${doc.url}"><strong>${doc.title}</strong></a><br><span>${(doc.excerpt||'').slice(0,180)}...</span>`;
      out.appendChild(el);
    });
  }
  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (!q) { out.innerHTML = ''; return; }
    const res = idx.search(q + '*');
    render(res);
  });
}
document.addEventListener('DOMContentLoaded', initSearch);
