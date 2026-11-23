(function () {
  const key = 'theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let saved = null;
  try {
    saved = localStorage.getItem(key);
  } catch (error) {
    // The selector also works when storage is unavailable.
  }
  const applyTheme = () => {
    document.documentElement.dataset.theme = saved || (systemTheme.matches ? 'dark' : 'light');
  };
  applyTheme();
  systemTheme.addEventListener('change', applyTheme);
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-toggle').addEventListener('click', () => {
      saved = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(key, saved);
      } catch (error) {
        // Keep the selected theme for the current page.
      }
      applyTheme();
    });
  });
})();
