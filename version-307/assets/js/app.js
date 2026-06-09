(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var next = carousel.querySelector('[data-hero-next]');
    var previous = carousel.querySelector('[data-hero-prev]');
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartTimer();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        restartTimer();
      });
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        restartTimer();
      });
    }

    restartTimer();
  }

  function setupListingFilters() {
    var input = document.querySelector('[data-listing-search]');
    var grid = document.querySelector('[data-listing-grid]');
    var counter = document.querySelector('[data-result-counter]');

    if (!input || !grid) {
      return;
    }

    var cards = selectAll('.movie-card', grid);

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';

        if (matched) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = '当前显示 ' + visibleCount + ' 部';
      }
    }

    input.addEventListener('input', applyFilter);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupListingFilters();
  });
}());
