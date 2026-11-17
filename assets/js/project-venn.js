const venn = document.querySelector('.concept-venn');
const tooltip = venn.querySelector('.venn-tooltip');
const dialog = venn.querySelector('dialog');
const diagram = venn.querySelector('svg');
let hideTimer;

function hideTooltip() {
  clearTimeout(hideTimer);
  tooltip.hidden = true;
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideTooltip, 180);
}

venn.querySelectorAll('.concept-sector').forEach(area => {
  area.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || dialog.open) return;

    clearTimeout(hideTimer);
    tooltip.querySelector('strong').textContent = area.dataset.title;
    tooltip.querySelector('p').textContent = area.dataset.description;
    tooltip.hidden = false;

    const { offsetWidth, offsetHeight } = tooltip;
    const rect = diagram.getBoundingClientRect();
    const right = document.documentElement.clientWidth;
    const bottom = window.innerHeight;
    const gap = 8;
    let x = Math.max(gap, Math.min(event.clientX, right - offsetWidth - gap));
    let y = Math.max(gap, Math.min(event.clientY, bottom - offsetHeight - gap));
    let overlay = false;

    if (rect.right + offsetWidth + 2 * gap <= right) {
      x = rect.right + gap;
    } else if (rect.left >= offsetWidth + 2 * gap) {
      x = rect.left - offsetWidth - gap;
    } else if (rect.bottom + offsetHeight + 2 * gap <= bottom) {
      y = rect.bottom + gap;
    } else if (rect.top >= offsetHeight + 2 * gap) {
      y = rect.top - offsetHeight - gap;
    } else {
      overlay = true;
      y = event.clientY + offsetHeight + 2 * gap <= bottom
        ? event.clientY + gap : Math.max(gap, event.clientY - offsetHeight - gap);
    }

    tooltip.classList.toggle('is-overlay', overlay);
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  });
  area.addEventListener('pointerleave', scheduleHide);
  area.addEventListener('click', event => {
    event.preventDefault();
    hideTooltip();
    dialog.querySelector('h3').textContent = area.dataset.title;
    dialog.querySelector('p').textContent = area.dataset.description;
    dialog.showModal();
  });
});

tooltip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
tooltip.addEventListener('pointerleave', scheduleHide);
window.addEventListener('scroll', hideTooltip, { passive: true });
window.addEventListener('resize', hideTooltip);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') hideTooltip();
});
