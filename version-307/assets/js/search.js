(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function createCard(movie) {
    var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + escapeHtml(movie.url) + '">',
      '    <figure class="poster-frame">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
      '      <figcaption>' + escapeHtml(movie.type) + '</figcaption>',
      '    </figure>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="movie-meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '      <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="tag-row">' + tagHtml + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function setupSearch() {
    var form = document.querySelector('[data-search-form]');
    var input = form ? form.querySelector('input[name="q"]') : null;
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (!form || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function runSearch(query) {
      var keyword = normalize(query);
      var matched = data;

      if (keyword) {
        matched = data.filter(function (movie) {
          return normalize([
            movie.title,
            movie.region,
            movie.year,
            movie.type,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine
          ].join(' ')).indexOf(keyword) !== -1;
        });
      } else {
        matched = data.slice(0, 24);
      }

      results.innerHTML = matched.slice(0, 120).map(createCard).join('');

      if (summary) {
        if (keyword) {
          summary.textContent = '关键词“' + query + '”共匹配 ' + matched.length + ' 部，当前显示前 ' + Math.min(matched.length, 120) + ' 部。';
        } else {
          summary.textContent = '默认展示 24 部推荐影片；输入关键词后将显示匹配结果。';
        }
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = window.location.pathname + (query ? '?q=' + encodeURIComponent(query) : '');
      window.history.replaceState({}, '', nextUrl);
      runSearch(query);
    });

    input.addEventListener('input', function () {
      runSearch(input.value);
    });

    if (initialQuery) {
      input.value = initialQuery;
      runSearch(initialQuery);
    } else {
      runSearch('');
    }
  }

  document.addEventListener('DOMContentLoaded', setupSearch);
}());
