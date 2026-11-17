const conceptFigure = document.querySelector('.concept-figure');
const conceptDialog = conceptFigure.querySelector('dialog');
const conceptTitle = conceptDialog.querySelector('h3');
const conceptDescription = conceptDialog.querySelector('p');

conceptFigure.querySelectorAll('.concept-sector').forEach(sector => {
  sector.addEventListener('click', event => {
    event.preventDefault();
    conceptTitle.textContent = sector.dataset.title;
    conceptDescription.textContent = sector.dataset.description;
    conceptDialog.showModal();
  });
});

const conceptDisclosure = conceptFigure.querySelector('.concept-disclosure');

if (conceptDisclosure) {
  const summary = conceptDisclosure.querySelector('summary');
  const radial = conceptDisclosure.querySelector('.concept-radial');

  summary.addEventListener('click', async event => {
    if (!conceptDisclosure.open || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    event.preventDefault();
    if (conceptDisclosure.classList.contains('is-folding')) return;

    conceptDisclosure.classList.add('is-folding');
    radial.inert = true;
    await Promise.allSettled(radial.getAnimations({ subtree: true }).map(animation => animation.finished));
    conceptDisclosure.open = false;
    conceptDisclosure.classList.remove('is-folding');
    radial.inert = false;
  });
}
