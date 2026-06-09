(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var stage = player.querySelector('.player-stage');
            var button = player.querySelector('[data-play-button]');
            var source = player.getAttribute('data-src');
            var status = player.querySelector('[data-player-status]');
            var loaded = false;
            var hls = null;

            function updateStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function loadSource() {
                if (loaded || !video || !source) {
                    return;
                }

                loaded = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    updateStatus('播放器准备中');
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    updateStatus('播放器准备中');
                } else {
                    video.src = source;
                    updateStatus('尝试使用浏览器默认播放器');
                }

                player.classList.add('is-ready');
            }

            function playVideo() {
                loadSource();
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        updateStatus('请再次点击播放');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    playVideo();
                });
            }

            if (stage) {
                stage.addEventListener('click', function (event) {
                    if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                        return;
                    }
                    playVideo();
                });
            }

            if (video) {
                video.addEventListener('playing', function () {
                    updateStatus('正在播放');
                });

                video.addEventListener('pause', function () {
                    if (loaded) {
                        updateStatus('已暂停');
                    }
                });

                video.addEventListener('error', function () {
                    updateStatus('播放源加载失败，请刷新后重试');
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
}());
