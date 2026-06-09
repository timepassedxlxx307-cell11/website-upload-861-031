(function () {
  function setupPlayer() {
    var video = document.getElementById('video-player');
    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var hasStarted = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function startPlayback() {
      if (!source) {
        setStatus('当前影片没有可用播放源。');
        return;
      }

      button.classList.add('is-hidden');

      if (hasStarted) {
        video.play().catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
        });
        return;
      }

      hasStarted = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            setStatus('播放源已加载，请点击视频播放。');
          });
        }, { once: true });
        setStatus('正在使用浏览器原生 HLS 播放能力。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成，正在播放。');
          video.play().catch(function () {
            setStatus('播放源已加载，请点击视频播放。');
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放初始化失败，请刷新页面后重试。');
          }
        });
        return;
      }

      setStatus('当前浏览器暂不支持 HLS 播放。');
    }

    button.addEventListener('click', startPlayback);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
}());
