(function() {
  const key = "theme";
  const btn = document.getElementById("theme-toggle");
  const pref = localStorage.getItem(key) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
  document.documentElement.setAttribute('data-theme', pref);
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(key, next);
    });
  }
})();
