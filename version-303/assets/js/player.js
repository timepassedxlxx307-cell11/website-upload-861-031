(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var source = video ? video.getAttribute('data-src') : '';
      var hlsInstance = null;
      var prepared = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function prepareVideo() {
        if (!video || !source || prepared) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请稍后重试');
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
              prepared = false;
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('播放源已就绪');
        } else {
          video.src = source;
          setStatus('正在尝试使用浏览器播放器');
        }

        prepared = true;
      }

      function playVideo() {
        if (!video) {
          return;
        }
        prepareVideo();
        player.classList.add('is-loading');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            player.classList.remove('is-loading');
            player.classList.add('is-playing');
            setStatus('正在播放');
          }).catch(function () {
            player.classList.remove('is-loading');
            setStatus('请再次点击播放');
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('is-playing');
          setStatus('已暂停');
        });
        video.addEventListener('error', function () {
          setStatus('播放遇到问题，请刷新后重试');
        });
      }
    });
  });
})();
