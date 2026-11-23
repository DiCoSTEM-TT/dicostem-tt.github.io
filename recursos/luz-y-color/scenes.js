'use strict';

// The historical test is data. Its renderer also accepts new surface/light
// combinations without requiring a new image or changes to the UI.
const TEST_SCENES = [
  { id: 1, surface: 'blue', light: 'blue' },
  { id: 2, surface: 'red', light: 'blue' },
  { id: 3, surface: 'green', light: 'blue' },
  { id: 4, surface: 'blue', light: 'red' },
  { id: 5, surface: 'red', light: 'red' },
  { id: 6, surface: 'green', light: 'red' },
  { id: 7, surface: 'blue', light: 'green' },
  { id: 8, surface: 'red', light: 'green' },
  { id: 9, surface: 'green', light: 'green' }
];
if (typeof module !== 'undefined') module.exports = TEST_SCENES;
