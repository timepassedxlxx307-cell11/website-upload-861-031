(function () {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  const status = document.querySelector("[data-search-status]");
  const results = document.querySelector("[data-search-results]");
  const input = document.querySelector(".hero-search input[name='q']");

  if (input) {
    input.value = query;
  }

  const normalize = function (value) {
    return String(value || "").toLowerCase();
  };

  const list = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
  const filtered = query
    ? list.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));
        return haystack.indexOf(normalize(query)) !== -1;
      }).slice(0, 80)
    : list.slice(0, 32);

  if (status) {
    status.textContent = query ? "搜索结果" : "热门影片";
  }

  if (!results) {
    return;
  }

  const escapeHtml = function (value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const escapeAttr = function (value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  };

  if (!filtered.length) {
    results.innerHTML = "<div class=\"empty-card\">暂无相关影片</div>";
    return;
  }

  results.innerHTML = filtered.map(function (movie) {
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-frame\" href=\"" + escapeAttr(movie.href) + "\">",
      "<img class=\"poster-img\" src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-glow\"></span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<a class=\"movie-title\" href=\"" + escapeAttr(movie.href) + "\">" + escapeHtml(movie.title) + "</a>",
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\"><span>" + escapeHtml(movie.genre) + "</span></div>",
      "</div>",
      "</article>"
    ].join("");
  }).join("");

  document.querySelectorAll(".poster-img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-missing");
    }, { once: true });
  });
})();
