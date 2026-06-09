(function () {
    "use strict";

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileMenu() {
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = qsa("[data-hero-slide]");
        var dots = qsa("[data-hero-dot]");
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                activate(dotIndex);
                start();
            });
        });

        activate(0);
        start();
    }

    function setupHls(video, sourceUrl, shell) {
        if (!video || !sourceUrl) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = sourceUrl;
                }
            });
        } else {
            video.src = sourceUrl;
        }

        video.setAttribute("data-ready", "true");
        if (shell) {
            shell.classList.add("is-playing");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    function initPlayers() {
        qsa("[data-player]").forEach(function (shell) {
            var video = qs("video", shell);
            var button = qs("[data-play-button]", shell);
            var sourceUrl = shell.getAttribute("data-m3u8");
            if (!video || !button || !sourceUrl) {
                return;
            }
            button.addEventListener("click", function () {
                setupHls(video, sourceUrl, shell);
            });
        });
    }

    function createSearchCard(movie) {
        return [
            '<article class="movie-card">',
            '  <a class="movie-cover" href="' + escapeHtml(movie.detail_url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-image" loading="lazy" onerror="this.style.opacity=\'0\';" />',
            '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
            '    <span class="play-pill">播放</span>',
            '  </a>',
            '  <div class="movie-card-body">',
            '    <h3><a href="' + escapeHtml(movie.detail_url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '    <div class="movie-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
            '    <p>' + escapeHtml(movie.one_line) + '</p>',
            '    <div class="tag-row">' + (movie.tags || []).slice(0, 3).map(function (tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '  </div>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var root = qs("[data-search-page]");
        if (!root || !window.SEARCH_MOVIES) {
            return;
        }

        var data = window.SEARCH_MOVIES;
        var params = new URLSearchParams(window.location.search);
        var keywordInput = qs("[data-search-keyword]", root);
        var categorySelect = qs("[data-search-category]", root);
        var regionSelect = qs("[data-search-region]", root);
        var yearSelect = qs("[data-search-year]", root);
        var summary = qs("[data-search-summary]", root);
        var results = qs("[data-search-results]", root);
        var loadMore = qs("[data-load-more]", root);
        var shown = 0;
        var current = [];
        var pageSize = 60;

        function uniqueValues(key) {
            var values = [];
            var seen = Object.create(null);
            data.forEach(function (movie) {
                var value = movie[key];
                if (value && !seen[value]) {
                    seen[value] = true;
                    values.push(value);
                }
            });
            return values.sort(function (a, b) {
                return String(b).localeCompare(String(a), "zh-Hans-CN");
            });
        }

        function fillSelect(select, values, label) {
            if (!select) {
                return;
            }
            select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
                return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
            }).join('');
        }

        function applyParams() {
            if (keywordInput) {
                keywordInput.value = params.get("q") || "";
            }
            if (categorySelect) {
                categorySelect.value = params.get("category") || "";
            }
            if (regionSelect) {
                regionSelect.value = params.get("region") || "";
            }
            if (yearSelect) {
                yearSelect.value = params.get("year") || "";
            }
        }

        function filterData() {
            var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
            var category = categorySelect && categorySelect.value || "";
            var region = regionSelect && regionSelect.value || "";
            var year = yearSelect && yearSelect.value || "";
            return data.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.one_line, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (category && movie.category_slug !== category) {
                    return false;
                }
                if (region && movie.region !== region) {
                    return false;
                }
                if (year && String(movie.year) !== String(year)) {
                    return false;
                }
                return true;
            });
        }

        function render(reset) {
            if (reset) {
                shown = 0;
                current = filterData();
                results.innerHTML = "";
            }
            var next = current.slice(shown, shown + pageSize);
            results.insertAdjacentHTML("beforeend", next.map(createSearchCard).join(""));
            shown += next.length;
            summary.textContent = "共找到 " + current.length + " 部影片，已显示 " + shown + " 部。";
            loadMore.hidden = shown >= current.length;
        }

        function updateUrl() {
            var next = new URLSearchParams();
            if (keywordInput && keywordInput.value.trim()) {
                next.set("q", keywordInput.value.trim());
            }
            if (categorySelect && categorySelect.value) {
                next.set("category", categorySelect.value);
            }
            if (regionSelect && regionSelect.value) {
                next.set("region", regionSelect.value);
            }
            if (yearSelect && yearSelect.value) {
                next.set("year", yearSelect.value);
            }
            var url = window.location.pathname + (next.toString() ? "?" + next.toString() : "");
            window.history.replaceState(null, "", url);
        }

        fillSelect(categorySelect, Array.from(new Set(data.map(function (movie) { return movie.category_slug; }))).map(function (slug) {
            var found = data.find(function (movie) { return movie.category_slug === slug; });
            return found ? { slug: slug, name: found.category_name } : { slug: slug, name: slug };
        }).sort(function (a, b) {
            return a.name.localeCompare(b.name, "zh-Hans-CN");
        }).map(function (item) {
            return item.slug;
        }), "全部分类");

        if (categorySelect) {
            Array.prototype.slice.call(categorySelect.options).forEach(function (option) {
                if (!option.value) {
                    return;
                }
                var found = data.find(function (movie) { return movie.category_slug === option.value; });
                if (found) {
                    option.textContent = found.category_name;
                }
            });
        }

        fillSelect(regionSelect, uniqueValues("region"), "全部地区");
        fillSelect(yearSelect, uniqueValues("year"), "全部年份");
        applyParams();
        render(true);

        [keywordInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener(control.tagName === "INPUT" ? "input" : "change", function () {
                updateUrl();
                render(true);
            });
        });

        loadMore.addEventListener("click", function () {
            render(false);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initPlayers();
        initSearchPage();
    });
})();
