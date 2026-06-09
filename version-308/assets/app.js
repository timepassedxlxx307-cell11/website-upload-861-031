(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = $('.mobile-menu-button');
        var panel = $('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '☰';
            }
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function initFilters() {
        var panels = $all('[data-filter-panel]');
        panels.forEach(function (panel) {
            var input = $('[data-filter-input]', panel);
            var type = $('[data-type-filter]', panel);
            var year = $('[data-year-filter]', panel);
            var list = $('[data-filter-list]');
            var cards = list ? $all('[data-search]', list) : [];
            var query = getQueryValue();

            function apply() {
                var text = normalize(input && input.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matched = true;
                    if (text && haystack.indexOf(text) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear.indexOf(yearValue) === -1) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                });
            }

            if (input && query) {
                input.value = query;
            }
            [input, type, year].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
}());
