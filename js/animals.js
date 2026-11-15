/* =====================================================================
   Owner: Nurdaulet Rashken
   Assignment #5 — Animal explorer (animals.html)
   Category buttons + live search. Uses querySelectorAll, Array.from,
   filter / forEach (higher-order functions), switch and event listeners.
   (Replaces the old inline <script> in animals.html.)
   ===================================================================== */
(function () {
  'use strict';

  /* does a card belong to the selected category? (switch statement) */
  function matchesCategory(card, category) {
    switch (category) {
      case 'all':
        return true;
      case 'Mammal':
      case 'Bird':
      case 'Aquatic':
        return card.dataset.category === category;
      default:
        return false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var radios = document.querySelectorAll('input[name="animal-filter"]');
    var search = document.getElementById('animal-search');
    var counter = document.getElementById('animal-count');
    var emptyMessage = document.getElementById('animal-empty');
    var clearButton = document.getElementById('clear-animal-filters');
    var cards = Array.from(document.querySelectorAll('.animal-col'));
    var storageKey = 'cityzoo-animal-filters';
    if (!radios.length || !cards.length) return;

    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      radios.forEach(function (radio) {
        if (radio.value === saved.category) radio.checked = true;
      });
      if (typeof saved.query === 'string') search.value = saved.query;
    } catch (error) {
      /* Filtering remains available when storage is unavailable. */
    }

    function currentCategory() {
      var checked = document.querySelector('input[name="animal-filter"]:checked');
      return checked ? checked.value : 'all';
    }

    function applyFilters() {
      var category = currentCategory();
      var query = search ? search.value.trim().toLowerCase() : '';

      var visibleCards = cards.filter(function (card) {
        var name = card.querySelector('.card-title').textContent.toLowerCase();
        return matchesCategory(card, category) && name.indexOf(query) !== -1;
      });

      cards.forEach(function (card) {
        var visible = visibleCards.indexOf(card) !== -1;
        card.classList.toggle('d-none', !visible);
        if (visible) {                                   /* re-play the pop-in animation */
          card.classList.remove('card-pop');
          void card.offsetWidth;
          card.classList.add('card-pop');
        }
      });

      if (counter) counter.textContent = 'Showing ' + visibleCards.length + ' of ' + cards.length + ' animals';
      if (emptyMessage) emptyMessage.classList.toggle('d-none', visibleCards.length !== 0);
      if (clearButton) clearButton.disabled = category === 'all' && search.value === '';
      try {
        localStorage.setItem(storageKey, JSON.stringify({ category: category, query: search.value }));
      } catch (error) { /* Filtering does not depend on storage. */ }
      document.dispatchEvent(new Event('zoo:animal-filter'));
    }

    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        applyFilters();
        if (window.ZooSound) window.ZooSound.play('click');
      });
    });
    if (search) search.addEventListener('input', applyFilters);
    if (clearButton) clearButton.addEventListener('click', function () {
      document.getElementById('f-all').checked = true;
      search.value = '';
      applyFilters();
      search.focus();
    });
    applyFilters();
  });
})();
