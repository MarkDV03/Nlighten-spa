(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header background + mobile book bar after scrolling past the hero
  var top = document.querySelector('[data-top]');
  var bar = document.querySelector('.mobile-bar');
  function onScroll() {
    var y = window.scrollY;
    top.classList.toggle('is-scrolled', y > 20);
    if (bar) bar.classList.toggle('is-on', y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var btn = document.querySelector('[data-menu-btn]');
  var menu = document.querySelector('[data-menu]');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open);
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
  });

  // Reveal on scroll
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Pause the hero glow when offscreen or the tab is hidden
  var glow = document.querySelector('[data-glow]');
  if (glow && 'IntersectionObserver' in window) {
    var visible = true;
    var sync = function () { glow.classList.toggle('paused', !visible || document.hidden); };
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }).observe(glow);
    document.addEventListener('visibilitychange', sync);
  }

  // Treatment tabs (arrow keys move between tabs)
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tabs] [role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-in', on && !reduced);
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length], true); }
    });
  });

  // Booking form: design only until it's connected to a form service (e.g. Formspree)
  var form = document.querySelector('[data-book-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    var checks = [
      { input: form.querySelector('#name'), valid: function (v) { return v.trim().length > 0; } },
      { input: form.querySelector('#phone'), valid: function (v) { return v.replace(/\D/g, '').length >= 10; } }
    ];
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      checks.forEach(function (c) {
        var ok = c.valid(c.input.value);
        c.input.setAttribute('aria-invalid', !ok);
        document.getElementById(c.input.getAttribute('aria-describedby')).hidden = ok;
        if (!ok && !firstBad) firstBad = c.input;
      });
      if (firstBad) { firstBad.focus(); return; }
      status.textContent = 'Preview only: this form isn’t connected yet.';
    });
  }

  // Highlight today's hours
  var today = document.querySelector('.hours tr[data-day="' + new Date().getDay() + '"]');
  if (today) today.classList.add('is-today');

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
