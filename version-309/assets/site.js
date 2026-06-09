(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      showSlide(i);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  filterForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter(form);
    });
    var input = form.querySelector('input');
    if (input) {
      input.addEventListener('input', function () {
        runFilter(form);
      });
    }
  });

  var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      chipButtons.forEach(function (item) {
        if (item.closest('[data-filter-scope]') === button.closest('[data-filter-scope]')) {
          item.classList.remove('is-active');
        }
      });
      button.classList.add('is-active');
      var scope = button.closest('[data-filter-scope]') || document;
      var value = button.getAttribute('data-filter-chip') || '';
      applyFilter(scope, value);
    });
  });

  function runFilter(form) {
    var scope = form.closest('[data-filter-scope]') || document;
    var input = form.querySelector('input');
    applyFilter(scope, input ? input.value : '');
  }

  function applyFilter(scope, value) {
    var query = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var match = !query || text.indexOf(query) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });
    var empty = scope.querySelector('[data-empty]');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  var searchScope = document.querySelector('[data-search-page]');
  if (searchScope) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = searchScope.querySelector('input[name="local-search"]');
    if (input) {
      input.value = q;
    }
    applyFilter(searchScope, q);
  }

  window.setupMoviePlayer = function (source) {
    var video = document.querySelector('[data-movie-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-player-button]');
    var attached = false;
    var hls = null;

    function attachSource() {
      if (attached || !video) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    }

    function playVideo() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }
    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
