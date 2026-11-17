const team = document.querySelector('.team');
const cards = Array.from(team.querySelectorAll('.team-card'));
const avatars = document.createElement('div');
const panel = document.createElement('div');
const content = document.createElement('div');
let activeButton;

avatars.className = 'team-avatars';
panel.className = 'team-avatar-panel';
content.className = 'team-avatar-content';
content.inert = true;
panel.append(content);

cards.forEach((card, index) => {
  const name = card.querySelector('h3').textContent.trim();
  const portrait = card.querySelector('.team-photo').cloneNode();
  const button = document.createElement('button');
  card.id = `team-member-${index + 1}`;
  card.hidden = true;
  portrait.className = '';
  portrait.alt = '';
  button.type = 'button';
  button.className = 'team-avatar';
  button.title = name;
  button.setAttribute('aria-label', name);
  button.setAttribute('aria-controls', card.id);
  button.setAttribute('aria-expanded', 'false');
  button.append(portrait);
  avatars.append(button);
  content.append(card);

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
  });
});

team.classList.add('team-disclosure');
team.replaceChildren(avatars, panel);
