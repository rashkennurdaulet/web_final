/* Astana visitor hours and local clock. Owner: Saidazimov Mukhammadjan. */
(function () {
  'use strict';

  const timeZone = 'Asia/Almaty';
  const opening = 9 * 60;
  const lastEntry = 17 * 60;
  const closing = 18 * 60;
  const clockFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });

  document.addEventListener('DOMContentLoaded', function () {
    const clock = document.getElementById('current-datetime');
    const status = document.getElementById('zoo-open-status');
    const detail = document.getElementById('zoo-hours-detail');
    let previousState;

    function tick() {
      const now = new Date();
      const time = clockFormat.format(now);
      const [hour, minute] = time.split(':').map(Number);
      const minutes = hour * 60 + minute;
      const state = minutes < opening ? 'before-opening'
        : minutes >= closing ? 'after-closing'
        : minutes >= lastEntry ? 'last-entry-passed' : 'open';
      clock.textContent = time;
      clock.dateTime = now.toISOString();

      if (state !== previousState) {
        const isOpen = state === 'open' || state === 'last-entry-passed';
        status.textContent = isOpen ? 'Open now' : 'Closed now';
        status.dataset.open = String(isOpen);
        if (state === 'before-opening') detail.textContent = 'Opens today at 09:00';
        if (state === 'after-closing') detail.textContent = 'Opens tomorrow at 09:00';
        if (state === 'last-entry-passed') detail.textContent = 'Entry closed · Zoo closes at 18:00';
        if (state === 'open') detail.textContent = 'Last entry 17:00 · Closes at 18:00';
        previousState = state;
        document.dispatchEvent(new CustomEvent('zoo:hours', {detail: {state}}));
      }
    }

    tick();
    window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
  });
})();
