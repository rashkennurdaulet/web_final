/* Browser-only accounts for the Zoo Club classroom demo. */
(function () {
  'use strict';

  const accountKey = 'cityzoo-accounts';
  const sessionKey = 'cityzoo-active-email';

  function readAccounts() {
    return JSON.parse(localStorage.getItem(accountKey) || '[]');
  }

  function toHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Store a salted password verifier so the browser never saves the raw password.
  async function passwordVerifier(password, salt) {
    const secret = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bytes = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: Uint8Array.from(salt), iterations: 120000, hash: 'SHA-256' },
      secret,
      256
    );
    return toHex(new Uint8Array(bytes));
  }

  function showError(container, message) {
    const error = container.querySelector('[data-account-error]');
    error.textContent = message;
    error.classList.remove('d-none');
    error.focus();
  }

  function setupForm(form) {
    const submitButton = form.querySelector('[type="submit"]');
    const resetButton = form.querySelector('[type="reset"]');
    const errorBox = form.querySelector('[data-account-error]');

    form.addEventListener('zoo:validated', async function () {
      if (submitButton.disabled) return;
      const fields = new FormData(form);
      const email = fields.get('email').trim().toLowerCase();
      const password = fields.get('password');
      errorBox.classList.add('d-none');
      submitButton.disabled = true;
      if (resetButton) resetButton.disabled = true;
      form.setAttribute('aria-busy', 'true');

      try {
        if (!window.crypto?.subtle) {
          showError(form, 'Open the site on HTTPS or localhost to use Zoo Club accounts.');
          return;
        }
        if (form.dataset.accountForm === 'signup') {
          const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
          const verifier = await passwordVerifier(password, salt);
          const accounts = readAccounts();
          if (accounts.some(account => account.email === email)) {
            showError(form, 'An account already exists for this email. Use the Log In page.');
            return;
          }
          accounts.push({
            name: fields.get('name').trim(),
            email,
            phone: fields.get('phone').trim(),
            theme: window.ZooTheme.get(),
            salt,
            verifier
          });
          localStorage.setItem(accountKey, JSON.stringify(accounts));
          window.location.assign('login.html?created=1');
          return;
        }

        const account = readAccounts().find(saved => saved.email === email);
        if (!account || await passwordVerifier(password, account.salt) !== account.verifier) {
          showError(form, 'The email or password is incorrect. Check your details and try again.');
          return;
        }
        localStorage.setItem(sessionKey, account.email);
        window.location.assign('profile.html');
      } catch (error) {
        showError(form, 'This browser could not access your account. Check that browser storage is available and try again.');
      } finally {
        form.removeAttribute('aria-busy');
        submitButton.disabled = false;
        if (resetButton) resetButton.disabled = false;
      }
    });
  }

  function renderAccount() {
    let account;
    try {
      const email = localStorage.getItem(sessionKey);
      if (email) account = readAccounts().find(saved => saved.email === email);
    } catch (error) {
      // A browser without storage still has access to all public pages.
    }

    const link = document.querySelector('[data-account-link]');
    const currentPage = window.location.pathname.split('/').pop();
    const showProfileLink = Boolean(account) || currentPage === 'profile.html';
    link.href = showProfileLink ? 'profile.html' : 'login.html';
    link.textContent = showProfileLink ? 'Profile' : 'Log In';
    const isCurrentPage = currentPage === link.getAttribute('href');
    link.classList.toggle('active', isCurrentPage);
    if (isCurrentPage) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');

    const details = document.getElementById('profile-details');
    if (!details) return;
    details.classList.toggle('d-none', !account);
    document.getElementById('profile-guest').classList.toggle('d-none', Boolean(account));
    document.getElementById('profile-greeting').textContent = account?.name || '';
    document.getElementById('profile-name').textContent = account?.name || '';
    document.getElementById('profile-email').textContent = account?.email || '';
    document.getElementById('profile-phone').textContent = account?.phone || '';
    document.getElementById('profile-theme').value = window.ZooTheme.get();
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('[data-account-form]');
    if (form) setupForm(form);
    const signupNotice = document.getElementById('signup-notice');
    if (signupNotice && new URLSearchParams(window.location.search).get('created') === '1') {
      signupNotice.classList.remove('d-none');
    }

    const themeSelect = document.getElementById('profile-theme');
    const themeStatus = document.getElementById('profile-theme-status');
    if (themeSelect) {
      themeSelect.addEventListener('change', function () {
        const saved = window.ZooTheme.set(themeSelect.value);
        themeStatus.textContent = saved ? 'Appearance preference saved.' : 'Could not save the preference in this browser.';
      });
      document.addEventListener('themechange', function (event) {
        themeSelect.value = event.detail.theme;
        themeStatus.textContent = '';
      });
    }

    document.getElementById('logout-button')?.addEventListener('click', function () {
      try {
        localStorage.removeItem(sessionKey);
        window.location.replace('login.html');
      } catch (error) {
        showError(document.getElementById('main'), 'Could not log out. Check your browser storage settings.');
      }
    });
    renderAccount();
    window.addEventListener('pageshow', renderAccount);
    window.addEventListener('storage', function (event) {
      if (event.key === sessionKey || event.key === accountKey || event.key === null) renderAccount();
    });
  });
})();
