/* Page background palettes. Owner: Saidazimov Mukhammadjan. */
(function () {
  'use strict';

  const palettes = [
    {name: 'Zoo Mist', day: '#f4f7f5', night: '#0d1b14'},
    {name: 'Savannah', day: '#fff3cd', night: '#211b10'},
    {name: 'Jungle', day: '#d8f3dc', night: '#13261b'},
    {name: 'Ocean', day: '#d9eefc', night: '#101d2a'},
    {name: 'Flamingo', day: '#fde2e4', night: '#271c22'},
    {name: 'Lavender', day: '#ece6fb', night: '#211a2e'}
  ];
  const storageKey = 'cityzoo-bg-index';

  function readIndex() {
    try {
      const index = Number(localStorage.getItem(storageKey));
      return Number.isInteger(index) && palettes[index] ? index : 0;
    } catch (error) {
      return 0;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('bgColorBtn');
    const label = button.querySelector('.bg-color-name');
    let index = readIndex();

    function apply() {
      const palette = palettes[index];
      document.body.style.backgroundColor = palette[window.ZooTheme.get()];
      label.textContent = palette.name;
      button.setAttribute('aria-label', 'Change page background colour. Current: ' + palette.name);
    }

    apply();
    document.addEventListener('themechange', apply);
    button.addEventListener('click', function () {
      index = (index + 1) % palettes.length;
      try { localStorage.setItem(storageKey, String(index)); } catch (error) { /* Keep the current page usable. */ }
      apply();
    });
  });
})();
