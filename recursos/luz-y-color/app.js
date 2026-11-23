'use strict';
const ANSWERS = ['b','f','f','f','c','f','f','f','d'];
function evaluate(values) {
  if (values.length !== 9 || values.some(v => !'abcdef'.includes(v) || v.length !== 1)) throw new Error('Se requieren nueve respuestas válidas.');
  const count = pattern => pattern.reduce((n,[i,v]) => n + (values[i-1] === v ? 1 : 0),0);
  const correct = values.reduce((n,v,i) => n + (v === ANSWERS[i] ? 1 : 0),0);
  const pre1 = count([[2,'e'],[3,'e'],[4,'e'],[6,'e'],[7,'e'],[8,'e']]);
  const pre2 = count([[2,'c'],[3,'d'],[4,'b'],[6,'d'],[7,'b'],[8,'c']]);
  const pre3 = count([[2,'b'],[3,'b'],[4,'c'],[6,'c'],[7,'d'],[8,'d']]);
  const pre4 = count([[1,'f'],[5,'f'],[9,'f']]);
  const base = pre1 > 4 ? 1 : pre2 > 4 ? 2 : pre3 > 4 ? 3 : -1;
  const pattern = correct > 7 ? 0 : pre4 > 1 ? (base === -1 ? 4 : 40+base) : base;
  return {correct, pattern};
}
function setup() {
  const language = document.documentElement.lang.slice(0, 2);
  const ui = TEST_LOCALES[language] || TEST_LOCALES.es;
  // El estilo anterior se conserva como alternativa explícita y recuperable.
  const requestedStyle = new URLSearchParams(location.search).get('estilo');
  const graphics = requestedStyle === 'actual' ? ColourGraphics : ColourGraphicsVector;
  document.querySelectorAll('.language-switch a').forEach(link => {
    if (requestedStyle === 'actual' || requestedStyle === 'vectorial') {
      link.search = '?estilo=' + requestedStyle;
    }
  });
  const feedback = TEST_FEEDBACK[language] || FEEDBACK;
  const format = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
  const optionLabel = option => ui.colours[option.label];
  const form = document.querySelector('#quiz');
  const questions = document.querySelector('#questions');
  const result = document.querySelector('#result');
  const solutions = document.querySelector('#solutions');
  const progress = document.querySelector('#progress');

  const scenes = new Map(TEST_SCENES.map(scene => [scene.id, scene]));
  const colourKeys = { red: 'roja', green: 'verde', blue: 'azul' };
  const drawScene = (scene, spotlight, title) => graphics.scene({
    ...scene, spotlight, title, labels: ui.sceneLabels
  });

  questions.innerHTML = QUESTIONS.map(question => {
    const id = question.id;
    const scene = scenes.get(id);
    const description = format(ui.questionAlt, {
      apple: ui.appleColours[colourKeys[scene.surface]],
      bulb: (ui.bulbColours || ui.appleColours)[colourKeys[scene.light]]
    });
    return `<fieldset class="question-card card"><legend>${format(ui.question, { n: id })}</legend>
      <div class="question-body">
        ${drawScene(scene, true, description)}
        <div class="options">${question.options.map(option => `
          <label><input required type="radio" name="q${id}" value="${option.value}">
          <span>${optionLabel(option)}</span></label>`).join('')}
        </div>
      </div></fieldset>`;
  }).join('');

  const example = { surface: 'green', light: 'white' };
  const exampleToggle = document.querySelector('#example-toggle');
  const exampleScene = document.querySelector('#example-scene');
  const drawExample = spotlight => {
    exampleScene.innerHTML = drawScene(example, spotlight, spotlight ? ui.spotlightOn : ui.spotlightOff);
  };
  drawExample(true);
  exampleToggle.addEventListener('click', () => {
    const showSolution = exampleToggle.getAttribute('aria-pressed') !== 'true';
    exampleToggle.setAttribute('aria-pressed', String(showSolution));
    exampleToggle.textContent = showSolution ? exampleToggle.dataset.on : exampleToggle.dataset.off;
    drawExample(!showSolution);
  });
  document.querySelector('[data-diagram="prism"]').innerHTML = graphics.prism(ui.prismTitle);
  document.querySelector('[data-diagram="additive"]').innerHTML = graphics.additive(ui.additiveTitle);
  document.querySelector('#contrast-scene').innerHTML = graphics.scene({ ...scenes.get(2), spotlight: false, title: ui.invisible, background: '#000000' });

  function hideResults() {
    result.hidden = true;
    solutions.hidden = true;
  }

  form.addEventListener('change', () => {
    const answered = Array.from(new FormData(form).keys()).length;
    progress.textContent = format(ui.progress, { n: answered });
    document.querySelector('#progress-meter').value = answered;
    hideResults();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const values = QUESTIONS.map(question => data.get(`q${question.id}`));
    const outcome = evaluate(values);
    let patternText = ui.unclassified;
    if (outcome.pattern === 0) {
      patternText = ui.understood;
    } else if (outcome.pattern !== -1) {
      const pattern = outcome.pattern > 40
        ? 'PRE' + (outcome.pattern - 40) + ui.and + 'PRE4'
        : 'PRE' + outcome.pattern;
      patternText = format(ui.pattern, { pattern });
    }
    document.querySelector('#score').textContent = format(ui.score, { n: outcome.correct });
    document.querySelector('#pattern').textContent = patternText;
    document.querySelector('#historical').textContent = feedback[outcome.pattern];
    document.querySelector('#solution-list').innerHTML = QUESTIONS.map((question, index) => {
      const answerOption = question.options.find(option => option.value === ANSWERS[index]);
      const answer = optionLabel(answerOption);
      const chosen = optionLabel(question.options.find(option => option.value === values[index]));
      const appearance = answerOption.value === 'f'
        ? ui.invisible
        : format(ui.visible, { colour: answer.toLowerCase() });
      return `<article class="solution card">
        <h3>${format(ui.question, { n: question.id })}: ${answer}</h3>
        <p>${ui.chosen}: <strong>${chosen}</strong>.
          ${values[index] === ANSWERS[index] ? ui.correct : ui.answer + ': ' + answer + '.'}</p>
        <div class="solution-images">
          <figure>${drawScene(scenes.get(question.id), true, format(ui.initial, { n: question.id }))}
            <figcaption>${ui.spotlightOn}</figcaption></figure>
          <figure>${drawScene(scenes.get(question.id), false, format(ui.solutionAlt, { appearance }))}
            <figcaption>${ui.spotlightOff}</figcaption></figure>
        </div></article>`;
    }).join('');
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });

  form.addEventListener('reset', () => {
    hideResults();
    progress.textContent = format(ui.progress, { n: 0 });
    document.querySelector('#progress-meter').value = 0;
  });

  document.querySelector('#show-solutions').addEventListener('click', () => {
    solutions.hidden = false;
    document.querySelector('#solutions-title').focus();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    solutions.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
  });
}
if (typeof document !== 'undefined') setup();
if (typeof module !== 'undefined') module.exports = { evaluate, ANSWERS };
