import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

let apiPromise = null;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

/**
 * Lecteur YouTube embarqué. L'iframe fonctionne seule ; l'IFrame API est branchée
 * dessus quand elle est disponible pour permettre seekTo / play / pause depuis le timer.
 */
const YouTubePlayer = forwardRef(function YouTubePlayer({ videoId, title, start = 0 }, ref) {
  const iframeRef = useRef(null);
  const player = useRef(null);
  const ready = useRef(false);
  const pending = useRef(null);

  useEffect(() => {
    let cancelled = false;
    ready.current = false;
    loadApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;
      player.current = new YT.Player(iframeRef.current, {
        events: {
          onReady: () => {
            ready.current = true;
            if (pending.current) {
              pending.current();
              pending.current = null;
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      ready.current = false;
      player.current = null;
    };
  }, [videoId]);

  const run = (fn) => {
    if (ready.current && player.current) fn(player.current);
    else pending.current = () => player.current && fn(player.current);
  };

  useImperativeHandle(ref, () => ({
    seekTo: (sec, play = true) => run((p) => {
      p.seekTo(sec, true);
      if (play) p.playVideo();
    }),
    play: () => run((p) => p.playVideo()),
    pause: () => run((p) => p.pauseVideo()),
    mute: (m) => run((p) => (m ? p.mute() : p.unMute())),
  }));

  const origin = encodeURIComponent(window.location.origin);
  const src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&start=${start}&origin=${origin}`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <iframe
        key={videoId}
        ref={iframeRef}
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
});

export default YouTubePlayer;
