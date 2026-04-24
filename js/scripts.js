/**
 * Elloquist — Site Scripts
 * Version 1.0 - March 2026
 *
 * Features:
 *   - Scroll-triggered fade-in animations (via IntersectionObserver)
 *   - Active nav link highlighting as sections scroll into view
 *
 * No dependencies. Progressive enhancement — the page works without JS.
 */

(function () {
  'use strict';

  // Signal to CSS that JS is running — fade-in styles only activate with this class.
  // Without it (JS blocked/failed), all content is visible by default.
  document.documentElement.classList.add('js-animations-enabled');

  /* --------------------------------------------------------------------------
     Scroll-triggered fade-in
     Elements with class "fade-in" animate in when they enter the viewport.
     CSS handles the actual transition; JS only toggles "is-visible".
  -------------------------------------------------------------------------- */

  var fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target); // animate once, then stop watching
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -24px 0px'
    });

    fadeElements.forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    // Fallback: no IntersectionObserver support — show everything immediately
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* --------------------------------------------------------------------------
     Active nav link highlighting
     Sets aria-current="page" on the nav link whose section is in view.
     CSS uses [aria-current="page"] to apply the active style.
  -------------------------------------------------------------------------- */

  var sections  = document.querySelectorAll('section[id]');
  var navLinks  = document.querySelectorAll('.site-nav__link');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var targetId = '#' + entry.target.id;
          navLinks.forEach(function (link) {
            if (link.getAttribute('href') === targetId) {
              link.setAttribute('aria-current', 'page'); // enumerated value per ARIA 1.1
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, {
      threshold: 0.4
    });

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* --------------------------------------------------------------------------
     Social nav — fetch /data/social_links.json and render platform links.
     Falls back silently; footer site nav still provides core navigation.
  -------------------------------------------------------------------------- */

  var socialNavEl = document.getElementById('footer-social-nav');

  if (socialNavEl && typeof fetch !== 'undefined') {
    fetch('/data/social_links.json')
      .then(function (res) { return res.json(); })
      .then(function (links) {
        var label = document.createElement('p');
        label.className = 'site-footer__social-label';
        label.setAttribute('aria-hidden', 'true');
        label.textContent = 'Follow Elloquist';

        var list = document.createElement('ul');
        list.className = 'site-footer__social-list';
        list.setAttribute('role', 'list');

        links.forEach(function (link) {
          var li = document.createElement('li');
          var a  = document.createElement('a');
          a.href        = link.url;
          a.className   = 'site-footer__social-link';
          a.textContent = link.name;
          a.rel         = 'noopener noreferrer me';
          a.target      = '_blank';
          a.setAttribute('aria-label', 'Elloquist on ' + link.name + ' (opens in new tab)');
          li.appendChild(a);
          list.appendChild(li);
        });

        socialNavEl.appendChild(label);
        socialNavEl.appendChild(list);
      })
      .catch(function () { /* silent — footer site nav still provides navigation */ });
  }

})();
