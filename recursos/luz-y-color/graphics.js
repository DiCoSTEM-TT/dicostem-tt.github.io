'use strict';

// All scene layers use the same coordinate system. Scientific colours are kept
// independent of the interface theme so changing theme cannot change an answer.
const ColourGraphics = (() => {
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
  let sequence = 0;
  const escape = text => String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function reflect(surface, light) {
    if (!colours[surface] || !colours[light]) throw new Error('Unknown scene colour');
    const channels = colours[surface].channels.map((value, index) => value * colours[light].channels[index]);
    return Object.keys(colours).find(name => colours[name].channels.every((value, index) => value === channels[index]));
  }

  // SVG viewports isolate the original artwork without altering the archived
  // images. Each component can be positioned or combined independently.
  function shapedPatch(file, outline, name) {
    const id = 'original-part-' + ++sequence;
    return `<g data-part="${name}">
      <defs><clipPath id="${id}"><path d="${outline}"/></clipPath></defs>
      <image href="graphics/original/${file}" x="0" y="0" width="800" height="600" clip-path="url(#${id})"/>
    </g>`;
  }

  const parts = {
    apple(colour, spotlight = true) {
      const files = {
        blue: spotlight ? 'Q1.png' : 'R1.png',
        red: spotlight ? 'Q2.png' : 'R5.png',
        green: spotlight ? 'Q3.png' : 'R9.png',
        black: 'R2.png'
      };
      if (!files[colour]) throw new Error('Unsupported apple colour');
      const outline = 'M173 341C128 323 84 342 62 382C42 413 46 457 65 500C86 550 114 574 153 576C165 577 175 577 189 575C228 573 254 539 275 494C297 451 304 408 284 375C268 345 226 331 197 339C190 342 181 341 173 341ZM167 376L177 333Q182 314 190 325L180 344 173 376Z';
      const id = 'apple-shadow-' + ++sequence;
      return `<defs><radialGradient id="${id}"><stop stop-color="#000" stop-opacity=".8"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
        <ellipse cx="169" cy="573" rx="112" ry="23" fill="url(#${id})"/>
        ${shapedPatch(files[colour], outline, 'apple')}`;
    },
    bulb(colour, contrast = false) {
      const files = { blue: 'Q1.png', red: 'Q4.png', green: 'Q7.png', white: 'Q0.png' };
      if (!files[colour]) throw new Error('Unsupported bulb colour');
      if (contrast && colour !== 'blue') throw new Error('The historical contrast example uses blue light');
      // The convex outline follows the bulb halo; the second subpath retains
      // its base. Both exclude the disconnected arrow pixels in the source.
      const outline = 'M561 180 565 153 576 129 593 108 615 92 640 82 668 79 696 82 722 92 743 108 760 129 771 153 775 180 771 206 760 230 744 251 722 267 615 267 593 251 576 231 565 206ZM635 255H702V311H635Z';
      return shapedPatch(contrast ? 'R2b.png' : files[colour], outline, 'bulb');
    },
    spotlight(on, contrast = false) {
      return shapedPatch(on ? 'Q0.png' : contrast ? 'R2b.png' : 'R1.png', 'M468 0H485V40L500 38 515 23V0H532V83Q531 91 520 95L503 121V170L426 151 402 77 437 84 468 48Z', 'spotlight');
    },
    observer(contrast = false) {
      return shapedPatch(contrast ? 'R2b.png' : 'Q0.png', 'M588 416C618 423 613 409 638 413C672 405 720 444 763 506L740 492C720 509 703 523 665 526C642 535 634 543 622 550L617 517C603 501 617 472 623 456C607 447 594 430 588 416Z', 'observer');
    },
    ray(x1, y1, x2, y2, fill, width = 26) {
      const length = Math.hypot(x2 - x1, y2 - y1);
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      const body = Math.max(0, length - 85);
      return `<g data-part="ray" transform="translate(${x1} ${y1}) rotate(${angle})" fill="${fill}">
        <path d="M0 ${-width / 2}H${body}V${-width}L${length} 0 ${body} ${width}V${width / 2}H0Z"/>
        <path d="M-26 ${-width / 2}h16v${width}h-16ZM-48 ${-width / 2}h12v${width}h-12Z"/>
      </g>`;
    }
  };

  function scene({ surface, light, spotlight = true, title = '', background } = {}) {
    const reflected = reflect(surface, spotlight ? 'white' : light);
    const invisible = reflected === 'black';
    const contrast = background === '#000000';
    const stage = contrast ? '#000000' : '#808080';
    const id = 'colour-scene-' + ++sequence;
    return `<svg class="colour-scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-labelledby="${id}" data-surface="${surface}" data-light="${light}" data-spotlight="${spotlight}" data-reflected="${reflected}">
      <title id="${id}">${escape(title)}</title>
      <defs>
        <linearGradient id="${id}-beam" x1="1" y1="0" x2="0" y2="1">
          <stop stop-color="#ffffff" stop-opacity=".4"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity=".04"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="${stage}"/>
      <g data-layer="illumination">
        ${spotlight ? `<path d="M425 106 480 144 285 545 15 490Z" fill="url(#${id}-beam)"/>` : ''}
        ${spotlight ? parts.ray(363, 215, 261, 342, '#ffffff', 42) : ''}
        ${!invisible ? parts.ray(372, 493, 589, 493, colours[reflected].hex, 60) : ''}
      </g>
      <g data-layer="object">
        ${contrast && invisible ? '' : parts.apple(reflected, spotlight)}
      </g>
      <g data-layer="sources">
        ${parts.spotlight(spotlight, contrast)}
        ${parts.bulb(light, contrast)}
      </g>
      <g data-layer="incident-light">
        ${parts.ray(548, 286, 333, 438, colours[light].hex, 42)}
      </g>
      <g data-layer="observer">${parts.observer(contrast)}</g>
    </svg>`;
  }

  function prism(title) {
    return `<img class="support-diagram" src="graphics/original/Prisma.png" alt="${escape(title)}">`;
  }

  function additive(title) {
    return `<img class="support-diagram" src="graphics/original/MezclaLuz.png" alt="${escape(title)}">`;
  }

  return { colours, reflect, parts, scene, prism, additive };
})();
if (typeof module !== 'undefined') module.exports = ColourGraphics;
