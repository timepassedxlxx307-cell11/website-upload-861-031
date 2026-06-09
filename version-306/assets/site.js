(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector('.site-header');
        var menuButton = document.querySelector('[data-mobile-menu-button]');

        if (header && menuButton) {
            menuButton.addEventListener('click', function () {
                header.classList.toggle('menu-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var currentSlide = 0;
        var heroTimer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentSlide);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentSlide);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            heroTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (heroTimer) {
                    window.clearInterval(heroTimer);
                }
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();

        var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        filterForms.forEach(function (form) {
            var scopeSelector = form.getAttribute('data-filter-target');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
            var keyword = form.querySelector('[name="keyword"]');
            var type = form.querySelector('[name="type"]');
            var year = form.querySelector('[name="year"]');
            var reset = form.querySelector('[data-reset-filter]');

            function textOf(card) {
                return [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-genre') || ''
                ].join(' ').toLowerCase();
            }

            function applyFilter() {
                var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';

                cards.forEach(function (card) {
                    var ok = true;
                    if (keywordValue) {
                        ok = textOf(card).indexOf(keywordValue) !== -1;
                    }
                    if (ok && typeValue) {
                        ok = (card.getAttribute('data-type') || '').indexOf(typeValue) !== -1;
                    }
                    if (ok && yearValue) {
                        ok = (card.getAttribute('data-year') || '') === yearValue;
                    }
                    card.classList.toggle('hidden-by-filter', !ok);
                });
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter();
            });

            [keyword, type, year].forEach(function (field) {
                if (field) {
                    field.addEventListener('input', applyFilter);
                    field.addEventListener('change', applyFilter);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (keyword) {
                        keyword.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    applyFilter();
                });
            }
        });
    });
}());
