const panel = document.querySelector('.objective-progress');
const objectives = Array.from(panel.querySelectorAll('.objective-progress-row'));
let selected = null;
let hovered = null;

function showActiveObjective() {
  const active = hovered || selected;
  objectives.forEach(objective => { objective.open = objective === active; });
  panel.classList.toggle('has-active', Boolean(active));
}

objectives.forEach(objective => {
  const summary = objective.querySelector('summary');
  summary.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = objective;
    showActiveObjective();
  });
  objective.addEventListener('pointerleave', () => {
    if (hovered !== objective) return;
    hovered = null;
    showActiveObjective();
  });
  summary.addEventListener('click', event => {
    event.preventDefault();
    selected = selected === objective ? null : objective;
    hovered = null;
    showActiveObjective();
  });
});

panel.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  selected = null;
  hovered = null;
  showActiveObjective();
});

if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const entries = objectives.map(objective => ({
    objective,
    value: Number(objective.dataset.value),
    label: objective.querySelector('.objective-progress-value')
  }));
  function render(progress) {
    entries.forEach(({ objective, value, label }) => {
      objective.style.setProperty('--fraction', value * progress / 100);
      label.textContent = Math.round(value * progress) + '%';
    });
  }
  const observer = new IntersectionObserver(entriesInView => {
    if (!entriesInView.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    render(0);
    let start;
    function animate(now) {
      start ??= now;
      const elapsed = Math.min(1, (now - start) / 800);
      render(1 - (1 - elapsed) ** 3);
      if (elapsed < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  });
  observer.observe(panel.querySelector('header'));
}
