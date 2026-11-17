const venn = document.querySelector('.concept-venn');
const tooltip = venn.querySelector('.venn-tooltip');
const dialog = venn.querySelector('dialog');
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
    const x = Math.max(8, Math.min(event.clientX + 10, document.documentElement.clientWidth - offsetWidth - 8));
    const below = event.clientY + 10;
    const y = below + offsetHeight <= window.innerHeight - 8
      ? below : Math.max(8, event.clientY - offsetHeight - 10);
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
