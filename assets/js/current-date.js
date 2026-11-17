const dateLabel = document.querySelector('[data-current-date]');
const dateFormat = new Intl.DateTimeFormat(dateLabel.dataset.dateLocale, {
  dateStyle: 'long',
  timeZone: 'Europe/Madrid'
});

function updateCurrentDate() {
  const today = dateFormat.format(new Date());
  dateLabel.textContent = dateLabel.dataset.currentDate.replace('{date}', today);
}

updateCurrentDate();
window.addEventListener('pageshow', updateCurrentDate);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateCurrentDate();
});
