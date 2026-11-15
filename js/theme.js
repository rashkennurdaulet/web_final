/* Day / Night theme switch. Owner: Nurdaulet Rashken. */
(function () {
  'use strict';

  const storageKey = 'cityzoo-theme';
  const accountKey = 'cityzoo-accounts';
  const sessionKey = 'cityzoo-active-email';
  const root = document.documentElement;

  function activeAccount() {
    const email = localStorage.getItem(sessionKey);
    if (!email) return {};
    const accounts = JSON.parse(localStorage.getItem(accountKey) || '[]');
    return {accounts, account: accounts.find(record => record.email === email)};
  }

  function savedTheme() {
    try {
      const {account} = activeAccount();
      return (account?.theme || localStorage.getItem(storageKey)) === 'night' ? 'night' : 'day';
    } catch (error) {
      return 'day';
    }
  }

  function get() {
    return root.dataset.bsTheme === 'dark' ? 'night' : 'day';
  }

  function apply(theme) {
    root.dataset.bsTheme = theme === 'night' ? 'dark' : 'light';
    const button = document.getElementById('themeToggle');
    if (button) {
      button.textContent = theme === 'night' ? '☀️ Light' : '🌙 Dark';
      button.setAttribute('aria-checked', String(theme === 'night'));
    }
    document.dispatchEvent(new CustomEvent('themechange', {detail: {theme}}));
  }

  function set(theme) {
    theme = theme === 'night' ? 'night' : 'day';
    let saved = true;
    try {
      const {account, accounts} = activeAccount();
      if (account) {
        account.theme = theme;
        localStorage.setItem(accountKey, JSON.stringify(accounts));
      } else {
        localStorage.setItem(storageKey, theme);
      }
    } catch (error) {
      saved = false;
    }
    apply(theme);
    return saved;
  }

  root.dataset.bsTheme = savedTheme() === 'night' ? 'dark' : 'light';
  window.ZooTheme = {set, get};

  document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('themeToggle');
    apply(savedTheme());
    button?.addEventListener('click', function () {
      set(get() === 'night' ? 'day' : 'night');
      window.ZooSound?.play('toggle');
    });
  });

  window.addEventListener('pageshow', function () {
    const theme = savedTheme();
    if (theme !== get()) apply(theme);
  });
  window.addEventListener('storage', function (event) {
    if (event.key === accountKey || event.key === sessionKey || event.key === storageKey || event.key === null) {
      const theme = savedTheme();
      if (theme !== get()) apply(theme);
    }
  });
})();
