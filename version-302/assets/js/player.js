(function () {
  const frame = document.querySelector("[data-player]");
  if (!frame) {
    return;
  }

  const video = frame.querySelector("video");
  const button = frame.querySelector(".player-start");
  const source = frame.getAttribute("data-source");
  let started = false;
  let hlsInstance = null;

  const startPlayback = function () {
    if (!video || !source) {
      return;
    }

    if (!started) {
      started = true;
      frame.classList.add("is-ready");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
