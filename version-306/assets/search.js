(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    ready(function () {
        var data = window.MOVIE_SEARCH_DATA || [];
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var count = document.querySelector('[data-search-count]');
        var form = document.querySelector('[data-search-form]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (!input || !results) {
            return;
        }

        input.value = initialQuery;

        function render(items) {
            if (count) {
                count.textContent = String(items.length);
            }

            if (!items.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配结果，请尝试更换关键词。</div>';
                return;
            }

            results.innerHTML = items.slice(0, 160).map(function (movie) {
                return [
                    '<article class="search-result-card">',
                    '    <a href="' + escapeHtml(movie.url) + '"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></a>',
                    '    <div>',
                    '        <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
                    '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                    '        <div class="movie-meta">',
                    '            <span>' + escapeHtml(movie.year) + '</span>',
                    '            <span>' + escapeHtml(movie.region) + '</span>',
                    '            <span>' + escapeHtml(movie.type) + '</span>',
                    '            <span>' + escapeHtml(movie.category) + '</span>',
                    '        </div>',
                    '    </div>',
                    '</article>'
                ].join('\n');
            }).join('\n');
        }

        function search() {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                render(data.slice(0, 80));
                return;
            }

            var keywords = query.split(/\s+/).filter(Boolean);
            var matched = data.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(' ').toLowerCase();
                return keywords.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
            });

            render(matched);
        }

        input.addEventListener('input', search);

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                search();
            });
        }

        search();
    });
}());
