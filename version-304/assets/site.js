(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var nav = qs('.site-nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('.hero');
    if (!hero) return;
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    if (!slides.length) return;
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearchJump() {
    var form = qs('.global-search-form');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input', form);
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) target += '?q=' + encodeURIComponent(query);
      window.location.href = target;
    });
  }

  function initFilters() {
    var scope = qs('.filter-scope');
    if (!scope) return;
    var searchInput = qs('.search-input');
    var yearSelect = qs('.year-filter');
    var typeSelect = qs('.type-filter');
    var cards = qsa('.movie-card', scope);
    var empty = qs('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) searchInput.value = q;
    function apply() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var ok = true;
        if (keyword && hay.indexOf(keyword) === -1) ok = false;
        if (year && cardYear !== year) ok = false;
        if (type && cardType !== type) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('show', visible === 0);
    }
    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (!control) return;
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function initPlayers() {
    qsa('.player-frame').forEach(function (frame) {
      var video = qs('video', frame);
      var button = qs('.play-overlay', frame);
      if (!video || !button) return;
      var url = video.getAttribute('data-video-url');
      var loaded = false;
      function load() {
        if (loaded || !url) return;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = url;
        }
        loaded = true;
      }
      function start() {
        load();
        button.classList.add('is-hidden');
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) start();
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) button.classList.remove('is-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchJump();
    initFilters();
    initPlayers();
  });
})();
