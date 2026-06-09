(function () {
    var ready = function (callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    ready(function () {
        var mobileToggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q'], input[type='search']");
                var value = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                if (value) {
                    window.location.href = target + "?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            var showSlide = function (nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            };

            var start = function () {
                clearInterval(timer);
                timer = setInterval(function () {
                    showSlide(index + 1);
                }, 5200);
            };

            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            showSlide(0);
            start();
        }

        var searchInput = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var activeFilter = "all";

        var normalize = function (value) {
            return String(value || "").toLowerCase().trim();
        };

        var applyFilter = function () {
            if (!cards.length) {
                return;
            }
            var query = normalize(searchInput ? searchInput.value : "");
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
                var visible = matchesText && matchesFilter;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = shown !== 0;
            }
        };

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                searchInput.value = q;
            }
            if (searchInput.hasAttribute("data-autofocus")) {
                searchInput.focus();
            }
            searchInput.addEventListener("input", applyFilter);
        }

        document.querySelectorAll("[data-filter-value]").forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter-value") || "all";
                var group = button.closest("[data-filter-group]") || document;
                group.querySelectorAll("[data-filter-value]").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });

        applyFilter();

        var player = document.querySelector("[data-player]");
        if (player) {
            var video = player.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var overlay = player.querySelector("[data-play-button]");
            var streamUrl = source ? source.getAttribute("src") : "";
            var hlsInstance = null;

            if (video && streamUrl) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                }

                var beginPlay = function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {});
                    }
                };

                if (overlay) {
                    overlay.addEventListener("click", beginPlay);
                }

                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });

                video.addEventListener("pause", function () {
                    if (overlay && video.currentTime === 0) {
                        overlay.classList.remove("is-hidden");
                    }
                });

                window.addEventListener("beforeunload", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            }
        }
    });
})();
