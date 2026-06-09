(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var previous = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      if (previous) {
        previous.addEventListener('click', function () {
          showSlide(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          restart();
        });
      }

      showSlide(0);
      restart();
    }

    var searchInput = document.getElementById('siteSearchInput');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var counter = document.querySelector('[data-result-counter]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));

    if (searchInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (query) {
        searchInput.value = query;
      }

      function applyFilters() {
        var keyword = normalize(searchInput.value);
        var visible = 0;
        var activeFilters = {};

        selects.forEach(function (select) {
          var key = select.getAttribute('data-filter-select');
          if (key && select.value) {
            activeFilters[key] = normalize(select.value);
          }
        });

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search-text'));
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesSelects = Object.keys(activeFilters).every(function (key) {
            return normalize(card.getAttribute('data-' + key)) === activeFilters[key];
          });
          var shouldShow = matchesKeyword && matchesSelects;
          card.classList.toggle('hidden-by-filter', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = visible + ' 部影片';
        }
      }

      searchInput.addEventListener('input', applyFilters);
      selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
      });
      applyFilters();
    }
  });
})();
