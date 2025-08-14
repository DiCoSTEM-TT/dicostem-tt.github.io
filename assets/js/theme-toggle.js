(function () {
  const KEY = "theme"; // valores posibles: 'light' | 'dark' | null (auto)
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const getSystem = () => (media.matches ? "dark" : "light");
  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Inicialización: si no hay preferencia guardada, seguir sistema
  const saved = localStorage.getItem(KEY); // null => automático
  apply(saved || getSystem());

  // Botón de cambio
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    // Clic normal: alterna y guarda preferencia (override manual)
    btn.addEventListener('click', (e) => {
      if (e.altKey) return; // lo gestiona el handler de abajo
      const current = localStorage.getItem(KEY) || getSystem();
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      apply(next);
    });

    // Alt + clic: volver a AUTOMÁTICO (sin preferencia guardada)
    btn.addEventListener('click', (e) => {
      if (!e.altKey) return;
      e.preventDefault();
      localStorage.removeItem(KEY);
      apply(getSystem());
    });

    btn.title = "Cambiar tema (Alt+clic: automático)";
    btn.setAttribute("aria-label", "Cambiar tema (Alt+clic: automático)");
  }

  // Seguir cambios del sistema SOLO si no hay preferencia guardada
  const followSystemIfAuto = () => {
    if (!localStorage.getItem(KEY)) apply(getSystem());
  };
  if (media.addEventListener) {
    media.addEventListener('change', followSystemIfAuto);
  } else if (media.addListener) {
    media.addListener(followSystemIfAuto); // Safari antiguo
  }
})();
