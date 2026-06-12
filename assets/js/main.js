/* =============================================================
   仙台中央青果卸売協同組合 — Interactions
   -------------------------------------------------------------
   Vanilla JS, no dependencies, progressive enhancement (the page
   still works if this never runs). Everything lives inside one
   IIFE so nothing leaks into the global scope. Sections, in order:
     1. Language toggle (JP/EN, remembered in localStorage)
     2. Header shrink-on-scroll
     3. Mobile drawer — open/close, background scroll-lock, accordions
     4. Scroll-reveal animations (IntersectionObserver)
     5. Count-up statistics
     6. Sticky sub-nav active-section highlighting (business page)
     7. Footer year
   All motion checks prefersReduced and is skipped when the visitor
   has "reduce motion" enabled.
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- 1. Language toggle (JP default / EN) ---------------- */
  var LANG_KEY = 'ssn-lang';
  function applyLang(lang) {
    var en = lang === 'en';
    root.classList.toggle('en', en);
    root.setAttribute('lang', en ? 'en' : 'ja');
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === lang));
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }
  // init from storage (set before paint via inline script; here we sync buttons)
  var saved = 'ja';
  try { saved = localStorage.getItem(LANG_KEY) || 'ja'; } catch (e) {}
  applyLang(saved);

  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang-btn'));
    });
  });

  /* ----- 2. Header scroll state ------------------------------ */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 24);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ----- 3. Mobile menu -------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  var scrollLockY = 0;
  function openMenu() {
    // lock the background scroll so the page behind can't move
    // (prevents the mobile address bar collapsing and leaving a gap)
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = (-scrollLockY) + 'px';
    document.body.classList.add('menu-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollLockY); // restore the scroll position
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (document.body.classList.contains('menu-open')) closeMenu(); else openMenu();
    });
  }
  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('.mobile-nav__scrim') || e.target.closest('.mobile-nav__close') || e.target.closest('a')) closeMenu();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  // Mobile sub-group accordions (collapsed by default; tap header to expand)
  document.querySelectorAll('[data-m-group]').forEach(function (g) {
    var trigger = g.querySelector('.m-toggle');
    if (trigger) {
      trigger.addEventListener('click', function () {
        var open = g.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(open));
      });
    }
  });

  /* ----- 4. Scroll reveal (IntersectionObserver) ------------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-stagger]');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute('data-stagger')) {
          var step = parseInt(el.getAttribute('data-stagger'), 10) || 80;
          Array.prototype.slice.call(el.children).forEach(function (child, i) {
            child.style.transitionDelay = (i * step) + 'ms';
          });
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ----- 5. Count-up numbers --------------------------------- */
  function fmtNum(n, decimals, group) {
    if (decimals) return n.toFixed(decimals);
    return group ? Math.round(n).toLocaleString('ja-JP') : String(Math.round(n));
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    var group = !el.hasAttribute('data-nogroup');
    var dur = 1400, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = fmtNum(target * eased, decimals, group);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = fmtNum(target, decimals, group);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        var t = parseFloat(el.getAttribute('data-count'));
        el.textContent = fmtNum(t, (el.getAttribute('data-count').split('.')[1] || '').length, !el.hasAttribute('data-nogroup'));
      });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ----- 6. Sticky sub-nav active section (business page) ---- */
  var subnav = document.querySelector('.subnav');
  if (subnav) {
    var links = Array.prototype.slice.call(subnav.querySelectorAll('a[href^="#"]'));
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          links.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ----- 7. Footer year -------------------------------------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
