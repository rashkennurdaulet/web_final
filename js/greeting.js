/* Home greeting based on Astana visitor hours. Owner: Saidazimov Mukhammadjan. */
(function () {
  'use strict';

  const greeting = document.getElementById('hero-greeting');
  const messages = {
    'before-opening': 'The gates open at 09:00. Plan your route while you wait.',
    'open': 'The gates are open. Start with the animal guide or plan your route.',
    'last-entry-passed': 'Last entry has passed. Plan your next visit below.',
    'after-closing': 'The zoo is closed for the day. See you tomorrow!'
  };

  document.addEventListener('zoo:hours', function (event) {
    greeting.textContent = messages[event.detail.state];
  });
})();
