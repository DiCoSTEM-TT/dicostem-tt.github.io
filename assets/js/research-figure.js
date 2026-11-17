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
