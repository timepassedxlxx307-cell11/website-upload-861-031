(function () {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      const open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dotsWrap = document.querySelector('.hero-dots');
  let activeSlide = slides.findIndex(function (slide) {
    return slide.classList.contains('is-active');
  });

  if (activeSlide < 0) {
    activeSlide = 0;
  }

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeSlide);
      });
    }
  }

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, index) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', '第' + (index + 1) + '屏');
      dot.addEventListener('click', function () {
        showSlide(index);
      });
      dotsWrap.appendChild(dot);
    });

    showSlide(activeSlide);

    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeSlide - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeSlide + 1);
      });
    }

    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function applyFilter(input) {
    const grid = document.querySelector('.searchable-grid');

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const value = input.value.trim().toLowerCase();

    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-category') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      card.classList.toggle('is-hidden-card', value !== '' && haystack.indexOf(value) === -1);
    });
  }

  const pageFilter = document.getElementById('page-filter');

  if (pageFilter) {
    pageFilter.addEventListener('input', function () {
      applyFilter(pageFilter);
    });
  }

  const searchInput = document.getElementById('global-search-input');

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    searchInput.value = query;
    applyFilter(searchInput);

    searchInput.addEventListener('input', function () {
      applyFilter(searchInput);
    });
  }
}());

function setupMoviePlayer(videoId, buttonId, overlayId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const overlay = document.getElementById(overlayId);
  let attached = false;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  }

  function start() {
    attachStream();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.controls = true;

    const playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
}
