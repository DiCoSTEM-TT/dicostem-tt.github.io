const team = document.querySelector('.team');
const cards = Array.from(team.querySelectorAll('.team-card'));
const header = document.querySelector('.site-header');
const narrowView = matchMedia('(max-width: 960px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const avatars = document.createElement('div');
const panel = document.createElement('div');
const content = document.createElement('div');
let activeButton;

const accents = ['#EE763A', '#309F52', '#00A59F', '#2A7EBA', '#5A3F8B', '#CA3960'];
for (let i = accents.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [accents[i], accents[j]] = [accents[j], accents[i]];
}

avatars.className = 'team-avatars';
panel.className = 'team-avatar-panel';
content.className = 'team-avatar-content';
content.inert = true;
panel.append(content);

cards.forEach((card, index) => {
  const name = card.querySelector('h3').textContent.trim();
  const portrait = card.querySelector('.team-photo').cloneNode();
  const button = document.createElement('button');
  const label = document.createElement('span');
  label.className = 'team-avatar-name';
  const givenName = card.dataset.givenName;

  if (givenName && name.startsWith(givenName + ' ')) {
    const given = document.createElement('span');
    const surnames = document.createElement('span');
    given.textContent = givenName;
    surnames.textContent = name.slice(givenName.length + 1);
    label.append(given, ' ', surnames);
  } else {
    label.textContent = name;
  }
  card.id = `team-member-${index + 1}`;
  card.hidden = true;
  portrait.className = '';
  portrait.alt = '';
  button.type = 'button';
  button.className = 'team-avatar';
  button.style.setProperty('--avatar-accent', accents[index % accents.length]);
  button.setAttribute('aria-controls', card.id);
  button.setAttribute('aria-expanded', 'false');
  button.append(portrait, label);
  if (card.closest('.team-lead')) {
    const leadRow = document.createElement('div');
    leadRow.className = 'team-avatar-lead';
    leadRow.append(button);
    avatars.append(leadRow);
  } else {
    avatars.append(button);
  }
  content.append(card);

  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') button.classList.add('is-pointer-over');
  });
  button.addEventListener('pointerleave', () => button.classList.remove('is-pointer-over'));

  button.addEventListener('click', () => {
    const closing = activeButton === button;
    activeButton?.setAttribute('aria-expanded', 'false');
    panel.classList.toggle('is-open', !closing);
    content.inert = closing;

    if (closing) {
      activeButton = undefined;
      return;
    }

    activeButton = button;
    button.setAttribute('aria-expanded', 'true');
    cards.forEach(member => { member.hidden = member !== card; });

    if (narrowView.matches) {
      requestAnimationFrame(async () => {
        await Promise.allSettled(panel.getAnimations().map(animation => animation.finished));
        if (activeButton !== button || !narrowView.matches) return;

        const headerHeight = header?.getBoundingClientRect().height || 0;
        const top = window.scrollY + panel.getBoundingClientRect().top - headerHeight - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      });
    }
  });
});

team.classList.add('team-disclosure');
team.replaceChildren(avatars, panel);
