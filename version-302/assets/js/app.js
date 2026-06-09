(function () {
  const markMissingImages = function () {
    document.querySelectorAll("img").forEach(function (image) {
      const mark = function () {
        image.classList.add("is-missing");
      };
      image.addEventListener("error", mark, { once: true });
      if (image.complete && image.naturalWidth === 0) {
        mark();
      }
    });
  };

  const setupSliders = function () {
    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      const slides = Array.from(slider.querySelectorAll(".hero-slide"));
      const dots = Array.from(slider.querySelectorAll(".slider-dot"));
      let active = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      }));

      const show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      };

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }
    });
  };

  const setupSearchForms = function () {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const query = input ? input.value.trim() : "";
        const target = form.getAttribute("data-search-target") || "./search.html";
        const separator = target.indexOf("?") === -1 ? "?" : "&";
        window.location.href = target + separator + "q=" + encodeURIComponent(query);
      });
    });
  };

  markMissingImages();
  setupSliders();
  setupSearchForms();
})();
