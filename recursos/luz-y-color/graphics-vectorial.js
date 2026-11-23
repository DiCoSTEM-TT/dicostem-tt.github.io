'use strict';

// Escenas vectoriales del test de las manzanas (rediseño de noviembre de 2026).
// Estilo alternativo que convive con web/graphics.js: expone ColourGraphicsVector
// con la misma API pública que ColourGraphics (colours, reflect, parts, scene,
// prism, additive) y añade SURFACES, LIGHTS, combinations() y tones.
// No depende de imágenes: todas las piezas son SVG generado.
// Los colores científicos no dependen del tema de la interfaz.
const ColourGraphicsVector = (() => {
  const colours = {
    black: { channels: [0, 0, 0], hex: '#000000' },
    blue: { channels: [0, 0, 1], hex: '#0000ff' },
    green: { channels: [0, 1, 0], hex: '#00ff00' },
    red: { channels: [1, 0, 0], hex: '#ff0000' },
    cyan: { channels: [0, 1, 1], hex: '#00d9ec' },
    magenta: { channels: [1, 0, 1], hex: '#ed38d0' },
    yellow: { channels: [1, 1, 0], hex: '#ffe52e' },
    white: { channels: [1, 1, 1], hex: '#ffffff' }
  };
  // Superficies posibles de la manzana y luces posibles de la bombilla.
  // Una bombilla negra no emite luz, así que no se incluye.
  const SURFACES = ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'white', 'black'];
  const LIGHTS = ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'white'];

  const STAGE = '#808080';
  const CONTRAST_STAGE = '#000000';
  let sequence = 0;

  const escape = text => String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function reflect(surface, light) {
    if (!colours[surface] || !colours[light]) throw new Error('Unknown scene colour');
    const channels = colours[surface].channels.map((value, index) => value * colours[light].channels[index]);
    return Object.keys(colours).find(name => colours[name].channels.every((value, index) => value === channels[index]));
  }

  // ---------- Tonos derivados (volumen por capas planas, sin degradados) ----------
  const toRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const toHex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (hex, factor) => toHex(toRgb(hex).map(v => v * factor));
  const tint = (hex, amount) => toHex(toRgb(hex).map(v => v + (255 - v) * amount));

  const tones = {
    apple(name) {
      if (name === 'black') return { body: '#1a1a1a', side: '#0d0d0d', bottom: '#050505', cavity: '#000000', glow: '#3a3a3a' };
      if (name === 'white') return { body: '#ffffff', side: '#dedede', bottom: '#cccccc', cavity: '#b8b8b8', glow: '#ffffff' };
      const hex = colours[name].hex;
      return { body: hex, side: shade(hex, 0.8), bottom: shade(hex, 0.7), cavity: shade(hex, 0.62), glow: tint(hex, 0.42) };
    },
    bulb(name) {
      if (name === 'white') return { glass: '#ffffff', side: '#d4d4d4', wires: '#b0b0b0', filament: '#8c8c8c' };
      const hex = colours[name].hex;
      return { glass: hex, side: shade(hex, 0.7), wires: tint(hex, 0.36), filament: tint(hex, 0.79) };
    }
  };

  // ---------- Geometría compartida (sistema de coordenadas 800 × 600) ----------
  const APPLE_BODY = 'M170 372C140 350 82 352 62 400C42 448 60 520 100 552C126 572 150 568 170 562C190 568 214 572 240 552C280 520 298 448 278 400C258 352 200 350 170 372Z';
  // Haz del foco tangente a la manzana: termina dentro de ella y la manzana lo tapa.
  const BEAM = 'M375 84 439 145 264 526 170 462 76 398Z';
  // Sombra proyectada hacia la izquierda, en sentido contrario al foco.
  const CAST_SHADOW = 'M232 566C200 576 120 582 60 580C20 579 -10 574 -10 568C-10 560 40 556 110 556C170 556 230 558 232 566Z';
  const BULB_OFFSET_Y = 40;
  // Ojo calcado del original (Q0.png) y con el iris en gris.
  const EYE_WHITE = 'M656.5 454.4Q656.5 454.2 659.4 454.2Q662.2 454.2 663.0 454.6Q663.8 455.0 668.2 455.8Q672.8 456.5 685.5 465.4Q698.2 474.2 710.1 483.6Q722.0 493.0 722.8 493.8Q723.5 494.5 723.4 495.0Q723.2 495.5 719.8 497.6Q716.2 499.8 715.8 499.8Q715.2 499.8 714.8 500.2Q714.2 500.8 710.6 502.4Q707.0 504.0 702.0 505.9Q697.0 507.8 690.9 509.2Q684.8 510.8 676.8 511.8Q668.8 512.8 662.0 512.9Q655.2 513.0 655.2 512.4Q655.2 511.8 656.2 509.9Q657.2 508.0 658.6 503.8Q660.0 499.5 660.4 495.1Q660.8 490.8 660.8 484.5Q660.8 478.2 660.4 474.1Q660.0 470.0 659.0 466.6Q658.0 463.2 656.5 460.2Q655.0 457.2 655.0 456.2Q655.0 455.2 655.8 454.9Q656.5 454.5 656.5 454.4Z';
  const EYE_LINES = 'M641.2 412.4Q641.2 412.2 643.4 412.2Q645.5 412.2 649.2 413.1Q653.0 414.0 656.8 415.5Q660.5 417.0 663.5 418.6Q666.5 420.2 671.4 423.6Q676.2 427.0 676.6 427.0Q677.0 427.0 678.6 428.4Q680.2 429.8 681.0 430.0Q681.8 430.2 692.6 439.1Q703.5 448.0 724.1 467.1Q744.8 486.2 751.8 493.2Q758.8 500.2 759.2 500.9Q759.8 501.5 759.5 501.8Q759.2 502.0 735.5 481.6Q711.8 461.2 700.8 452.8Q689.8 444.2 683.1 439.6Q676.5 435.0 670.9 431.6Q665.2 428.2 657.2 424.6Q649.2 421.0 646.0 421.1Q642.8 421.2 641.5 421.8Q640.2 422.2 640.1 422.9Q640.0 423.5 646.6 425.8Q653.2 428.0 660.9 432.5Q668.5 437.0 677.8 444.1Q687.0 451.2 700.0 463.1Q713.0 475.0 723.5 486.1Q734.0 497.2 737.0 500.9Q740.0 504.5 740.0 505.1Q740.0 505.8 739.1 505.9Q738.2 506.0 734.8 503.1Q731.2 500.2 729.9 500.1Q728.5 500.0 726.6 502.0Q724.8 504.0 718.2 508.5Q711.8 513.0 706.8 515.9Q701.8 518.8 697.2 520.9Q692.8 523.0 688.2 524.5Q683.8 526.0 678.9 527.0Q674.0 528.0 663.0 528.6Q652.0 529.2 645.5 530.1Q639.0 531.0 636.6 531.6Q634.2 532.2 631.6 533.2Q629.0 534.2 624.8 536.6Q620.5 539.0 615.5 543.9Q610.5 548.8 608.9 549.8Q607.2 550.8 607.1 550.1Q607.0 549.5 608.0 546.9Q609.0 544.2 612.0 539.2Q615.0 534.2 618.1 530.8Q621.2 527.2 625.5 524.4Q629.8 521.5 629.8 520.6Q629.8 519.8 628.8 517.5Q627.8 515.2 624.9 510.8Q622.0 506.2 620.5 502.2Q619.0 498.2 618.0 493.2Q617.0 488.2 617.0 483.5Q617.0 478.8 617.6 475.1Q618.2 471.5 619.6 467.5Q621.0 463.5 623.5 459.2Q626.0 455.0 626.0 454.1Q626.0 453.2 621.1 451.6Q616.2 450.0 611.9 447.0Q607.5 444.0 603.9 440.1Q600.2 436.2 598.5 433.5Q596.8 430.8 594.0 427.4Q591.2 424.0 590.6 422.9Q590.0 421.8 589.6 420.1Q589.2 418.5 589.5 418.1Q589.8 417.8 590.4 417.8Q591.0 417.8 594.2 419.4Q597.5 421.0 602.5 422.5Q607.5 424.0 610.2 424.5Q613.0 425.0 620.2 425.4Q627.5 425.8 628.1 425.2Q628.8 424.8 629.4 422.4Q630.0 420.0 631.6 418.0Q633.2 416.0 635.6 414.5Q638.0 413.0 639.6 412.8Q641.2 412.5 641.2 412.4ZM649.6 453.5Q649.5 453.5 644.9 453.6Q640.2 453.8 637.6 454.2Q635.0 454.8 634.6 455.4Q634.2 456.0 633.0 456.6Q631.8 457.2 630.0 459.2Q628.2 461.2 626.6 464.8Q625.0 468.2 624.0 472.1Q623.0 476.0 622.8 478.5Q622.5 481.0 622.8 485.9Q623.0 490.8 624.5 496.0Q626.0 501.2 629.1 506.9Q632.2 512.5 634.2 513.9Q636.2 515.2 638.1 515.9Q640.0 516.5 640.2 516.9Q640.5 517.2 642.8 517.2Q645.0 517.2 646.2 516.8Q647.5 516.2 649.1 516.1Q650.8 516.0 653.4 514.8Q656.0 513.5 657.2 513.8Q658.5 514.0 660.8 513.6Q663.0 513.2 668.1 513.1Q673.2 513.0 681.6 511.6Q690.0 510.2 695.8 508.6Q701.5 507.0 707.4 504.5Q713.2 502.0 718.4 499.0Q723.5 496.0 723.8 495.0Q724.0 494.0 710.8 483.5Q697.5 473.0 685.2 464.5Q673.0 456.0 666.6 454.8Q660.2 453.5 658.2 453.8Q656.2 454.0 653.0 453.8Q649.8 453.5 649.6 453.5Z';

  // Flecha con dos rayas de movimiento. (x, y) es el arranque del cuerpo;
  // angle en grados; length incluye la punta.
  function arrow({ x, y, angle, length, half, head, headLength, fill, name }) {
    const body = length - headLength;
    const stripes = half >= 20 ? [[-52, 10], [-32, 14]] : [[-40, 9], [-24, 12]];
    return `<g data-part="${name}" transform="translate(${x} ${y}) rotate(${angle})" fill="${fill}">
      ${stripes.map(([sx, w]) => `<rect x="${sx}" y="${-half}" width="${w}" height="${half * 2}"/>`).join('')}
      <rect x="0" y="${-half}" width="${body}" height="${half * 2}"/>
      <path d="M${body} ${-head} ${length} 0 ${body} ${head}Z"/>
    </g>`;
  }

  const parts = {
    stage(background = STAGE) {
      return `<rect data-part="stage" width="800" height="600" fill="${background}"/>`;
    },
    beam(gradientId) {
      return `<defs><linearGradient id="${gradientId}" x1="1" y1="0" x2="0" y2="1">
        <stop stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/>
      </linearGradient></defs>
      <path data-part="beam" d="${BEAM}" fill="url(#${gradientId})"/>`;
    },
    spotlightRay() {
      return arrow({ name: 'spotlight-ray', x: 362, y: 182, angle: 124, length: 159, half: 14, head: 30, headLength: 64, fill: '#ffffff' });
    },
    incidentRay(light) {
      // Prolongar el eje hacia atrás debe llevar al filamento, no al casquillo.
      const filament = { x: 680, y: 196 + BULB_OFFSET_Y };
      const target = { x: 304, y: 424 };
      const dx = target.x - filament.x, dy = target.y - filament.y;
      const distance = Math.hypot(dx, dy);
      const offset = 130; // Deja el cuerpo y las rayas fuera del cristal.
      return arrow({ name: 'incident-ray',
        x: filament.x + dx * offset / distance,
        y: filament.y + dy * offset / distance,
        angle: Math.atan2(dy, dx) * 180 / Math.PI,
        length: distance - offset, half: 14, head: 32, headLength: 70,
        fill: colours[light].hex });
    },
    reflectedRay(reflected) {
      return arrow({ name: 'reflected-ray', x: 352, y: 482, angle: 0, length: 236, half: 20, head: 42, headLength: 70, fill: colours[reflected].hex });
    },
    castShadow() {
      return `<path data-part="cast-shadow" d="${CAST_SHADOW}" fill="#000" opacity=".3"/>`;
    },
    // lit = foco blanco encendido: añade el brillo orientado hacia el foco.
    apple(colour, lit = true) {
      if (!colours[colour]) throw new Error('Unsupported apple colour');
      const t = tones.apple(colour);
      return `<g data-part="apple" data-colour="${colour}">
        <path d="${APPLE_BODY}" fill="${t.body}"/>
        <path d="M100 372C68 380 50 420 58 460C66 510 92 548 126 562C104 552 90 530 84 500C74 455 78 405 100 372Z" fill="${t.side}"/>
        ${lit ? `<path data-part="apple-bottom-shadow" d="M60 470C62 520 100 566 150 566C190 570 226 556 250 534C200 556 110 548 60 470Z" fill="${t.bottom}"/>` : ''}
        <ellipse cx="170" cy="381" rx="24" ry="8" fill="${t.cavity}"/>
        ${lit ? `<g data-part="apple-highlight">
          <path d="M245 410C240 385 215 372 195 375C215 385 230 400 236 425Z" fill="${t.glow}"/>
          <ellipse cx="228" cy="424" rx="8" ry="19" fill="#fff" opacity=".85" transform="rotate(-28 228 424)"/>
          <circle cx="214" cy="398" r="4" fill="#fff"/>
        </g>` : ''}
        <path d="M168 380C166 360 170 340 182 326L190 332C180 344 176 362 176 382Z" fill="#4a3b2f"/>
        <path d="M174 380C173 362 177 346 186 332L190 332C180 344 176 362 176 382Z" fill="#6e5a49"/>
      </g>`;
    },
    spotlight(on = true, contrast = false) {
      const c = contrast
        ? { mount: '#5a5a5a', yoke: '#646464', back: '#4a4a4a', body: '#5e5e5e', top: '#727272', fin: '#505050', hood: '#555555', hoodTop: '#6a6a6a', pivot: '#808080' }
        : { mount: '#2b2b2b', yoke: '#3a3a3a', back: '#1f1f1f', body: '#333333', top: '#474747', fin: '#262626', hood: '#2a2a2a', hoodTop: '#3f3f3f', pivot: '#555555' };
      const lens = on
        ? '<ellipse cx="64" cy="0" rx="14" ry="52" fill="#fff" opacity=".3"/><ellipse cx="62" cy="0" rx="9" ry="44" fill="#ececec"/><ellipse cx="63" cy="0" rx="6" ry="34" fill="#fff"/>'
        : '<ellipse cx="62" cy="0" rx="9" ry="44" fill="#6e6e6e"/><ellipse cx="63" cy="0" rx="6" ry="34" fill="#8a8a8a"/>';
      return `<g data-part="spotlight" data-on="${on}">
        <rect x="440" y="0" width="70" height="10" fill="${c.mount}"/>
        <path d="M466 0H478L456 72 444 68Z" fill="${c.yoke}"/>
        <g transform="translate(450 70) rotate(134)">
          <rect x="-72" y="-26" width="22" height="52" rx="6" fill="${c.back}"/>
          <rect x="-56" y="-34" width="82" height="68" rx="8" fill="${c.body}"/>
          <rect x="-50" y="-34" width="70" height="12" fill="${c.top}"/>
          <rect x="-46" y="-34" width="6" height="68" fill="${c.fin}"/><rect x="-34" y="-34" width="6" height="68" fill="${c.fin}"/><rect x="-22" y="-34" width="6" height="68" fill="${c.fin}"/>
          <path d="M25 -38 62 -46V46L25 38Z" fill="${c.hood}"/>
          <path d="M25 -38 62 -46V-34L25 -28Z" fill="${c.hoodTop}"/>
          ${lens}
        </g>
        <circle cx="450" cy="70" r="10" fill="${c.pivot}"/>
      </g>`;
    },
    // lit = foco blanco encendido: añade el reflejo del cristal orientado hacia el foco.
    bulb(colour, lit = true) {
      if (!LIGHTS.includes(colour)) throw new Error('Unsupported bulb colour');
      const t = tones.bulb(colour);
      return `<g data-part="bulb" data-colour="${colour}" transform="translate(0 ${BULB_OFFSET_Y})">
        <circle cx="680" cy="180" r="98" fill="${t.glass}" opacity=".1"/>
        <path d="M680 105C720 105 748 135 748 172C748 200 732 216 720 232C712 243 710 252 708 258H652C650 252 648 243 640 232C628 216 612 200 612 172C612 135 640 105 680 105Z" fill="${t.glass}"/>
        <path d="M700 110C735 122 748 150 748 172C748 200 732 216 720 232C712 243 710 252 708 258H690C694 240 712 222 720 200C728 175 722 135 700 110Z" fill="${t.side}"/>
        <path d="M668 258 670 200M692 258 690 200" stroke="${t.wires}" stroke-width="3"/>
        <path d="M670 200 674 191 678 200 682 191 686 200 690 200" fill="none" stroke="${t.filament}" stroke-width="3" stroke-linejoin="round"/>
        ${lit ? `<g data-part="bulb-highlight"><path d="M640 140C650 120 668 113 680 116C664 124 654 136 650 154Z" fill="#fff" opacity=".7"/><circle cx="636" cy="166" r="4" fill="#fff" opacity=".6"/></g>` : ''}
        <rect x="650" y="258" width="60" height="10" rx="3" fill="#bdbdbd"/><rect x="652" y="268" width="56" height="8" fill="#8f8f8f"/>
        <rect x="650" y="276" width="60" height="10" rx="3" fill="#bdbdbd"/><rect x="652" y="286" width="56" height="8" fill="#8f8f8f"/>
        <rect x="650" y="294" width="60" height="10" rx="3" fill="#bdbdbd"/>
        <rect x="694" y="258" width="16" height="46" fill="#000" opacity=".12"/>
        <path d="M658 304H702L692 320H668Z" fill="#4a4a4a"/>
      </g>`;
    },
    observer(contrast = false) {
      return `<g data-part="observer">
        <path d="${EYE_WHITE}" fill="#fff"/>
        <ellipse cx="643.7" cy="485.1" rx="19" ry="34" fill="#9a9a9a"/>
        <ellipse cx="643.7" cy="485.1" rx="14" ry="28" fill="#6e6e6e"/>
        <ellipse cx="643.7" cy="485.1" rx="9.5" ry="18" fill="#1a1a1a"/>
        <circle cx="647.1" cy="469.3" r="3.8" fill="#fff"/>
        <path d="${EYE_LINES}" fill="${contrast ? '#8c8c8c' : '#111'}" fill-rule="evenodd"/>
      </g>`;
    },
    ray(x1, y1, x2, y2, fill, width = 28) {
      const length = Math.hypot(x2 - x1, y2 - y1);
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      const half = width / 2;
      return arrow({ name: 'ray', x: x1, y: y1, angle, length, half, head: half * 2.2, headLength: Math.min(70, length / 3), fill });
    }
  };

  // Escena completa. spotlight = foco blanco encendido.
  // background '#000000' = ejemplo de contraste: una manzana que se ve negra no se dibuja.
  function scene({ surface, light, spotlight = true, title = '', background } = {}) {
    if (!colours[surface]) throw new Error('Unknown scene colour');
    if (!LIGHTS.includes(light)) throw new Error('Unknown scene colour');
    const reflected = reflect(surface, spotlight ? 'white' : light);
    const invisible = reflected === 'black';
    const contrast = background === CONTRAST_STAGE;
    const id = 'vector-scene-' + ++sequence;
    return `<svg class="colour-scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-labelledby="${id}" data-surface="${surface}" data-light="${light}" data-spotlight="${spotlight}" data-reflected="${reflected}">
      <title id="${id}">${escape(title)}</title>
      ${parts.stage(contrast ? CONTRAST_STAGE : STAGE)}
      <g data-layer="illumination">
        ${spotlight ? parts.beam(id + '-beam') + parts.spotlightRay() : ''}
      </g>
      <g data-layer="object">
        ${spotlight ? parts.castShadow() : ''}
        ${contrast && invisible ? '' : parts.apple(reflected, spotlight)}
      </g>
      <g data-layer="sources">
        ${parts.spotlight(spotlight, contrast)}
        ${parts.bulb(light, spotlight)}
      </g>
      <g data-layer="incident-light">${parts.incidentRay(light)}</g>
      <g data-layer="reflected-light">${invisible ? '' : parts.reflectedRay(reflected)}</g>
      <g data-layer="observer">${parts.observer(contrast)}</g>
    </svg>`;
  }

  // Todas las combinaciones manzana × bombilla, con su color reflejado al apagar el foco.
  function combinations() {
    return SURFACES.flatMap(surface => LIGHTS.map(light => ({ surface, light, reflected: reflect(surface, light) })));
  }

  // ---------- Diagramas de apoyo en el mismo estilo ----------
  function prism(title) {
    const id = 'vector-prism-' + ++sequence;
    // Haz que se ensancha desde el prisma y termina en una mancha redondeada sobre la pantalla.
    const ray = (x1, y1, half, fill) => {
      const x0 = 252, y0 = 102;
      const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
      const p = (x, y, k) => `${(x + nx * k).toFixed(1)} ${(y + ny * k).toFixed(1)}`;
      return `<g data-part="prism-ray" fill="${fill}"><path d="M${p(x0, y0, -1.5)} ${p(x1, y1, -half)} ${p(x1, y1, half)} ${p(x0, y0, 1.5)}Z"/><circle cx="${x1}" cy="${y1}" r="${half}"/></g>`;
    };
    return `<svg class="support-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-labelledby="${id}">
      <title id="${id}">${escape(title)}</title>
      <rect width="640" height="360" fill="${STAGE}"/>
      <g data-part="screen"><path d="M476 54H540L518 314H454Z" fill="#ffffff"/><path d="M528 54H540L518 314H506Z" fill="#d6d6d6"/></g>
      ${ray(506, 128, 13, '#ff0000')}
      ${ray(500, 176, 13, '#00ff00')}
      ${ray(490, 222, 13, '#0000ff')}
      <path d="M0 246 196 104" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
      <g data-part="prism">
        <path d="M226 26 300 232H152Z" fill="#e3e8e6"/>
        <path d="M226 26 300 232H262Z" fill="#c4ccc9"/>
        <path d="M220 52 188 140 200 140 226 64Z" fill="#fff" opacity=".7"/>
        <path d="M196 104H252" stroke="#fff" stroke-width="6"/>
      </g>
    </svg>`;
  }

  function additive(title) {
    const id = 'vector-additive-' + ++sequence;
    const circle = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="105"/>`;
    const R = circle(320, 135), G = circle(267, 226), B = circle(372, 226);
    return `<svg class="support-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-labelledby="${id}">
      <title id="${id}">${escape(title)}</title>
      <defs>
        <clipPath id="${id}-r">${R}</clipPath>
        <clipPath id="${id}-g">${G}</clipPath>
      </defs>
      <rect width="640" height="360" fill="#000"/>
      <g fill="#ff0000">${R}</g><g fill="#00ff00">${G}</g><g fill="#0000ff">${B}</g>
      <g fill="#ffff00" clip-path="url(#${id}-r)">${G}</g>
      <g fill="#ff00ff" clip-path="url(#${id}-r)">${B}</g>
      <g fill="#00ffff" clip-path="url(#${id}-g)">${B}</g>
      <g clip-path="url(#${id}-r)"><g fill="#ffffff" clip-path="url(#${id}-g)">${B}</g></g>
    </svg>`;
  }

  return { colours, SURFACES, LIGHTS, tones, reflect, parts, scene, combinations, prism, additive };
})();
if (typeof module !== 'undefined') module.exports = ColourGraphicsVector;
