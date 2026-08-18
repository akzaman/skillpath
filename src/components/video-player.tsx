import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { VideoSource } from "@/data/catalog";
import { embedSrc, parseVideoUrl } from "@/lib/video-url";
import { cn, formatDuration } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

type VideoPlayerProps = {
  sources: VideoSource[];
  poster?: string;
  title: string;
  initialTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
  className?: string;
};

export function VideoPlayer({
  sources,
  poster,
  title,
  initialTime = 0,
  onProgress,
  onEnded,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  onProgressRef.current = onProgress;
  onEndedRef.current = onEnded;

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [controls, setControls] = useState(true);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seekedInitial = useRef(false);
  const sourceKey = sources.map((item) => item.src).join("|");

  const showControls = useCallback(() => {
    setControls(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControls(false);
    }, 2400);
  }, []);

  useEffect(() => {
    seekedInitial.current = false;
    setPlaying(false);
    setStarted(false);
    setCurrent(0);
    setDuration(0);
    setError(null);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.load();
  }, [sourceKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setCurrent(video.currentTime);
      if (video.buffered.length) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      onProgressRef.current?.(video.currentTime, video.duration || 0);
    };
    const onMeta = () => {
      setDuration(video.duration || 0);
      if (!seekedInitial.current && initialTime > 1 && initialTime < video.duration - 2) {
        video.currentTime = initialTime;
        setCurrent(initialTime);
      }
      seekedInitial.current = true;
    };
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
      setError(null);
    };
    const onPause = () => {
      setPlaying(false);
      setControls(true);
      onProgressRef.current?.(video.currentTime, video.duration || 0);
    };
    const onVol = () => {
      setMuted(video.muted);
      setVolume(video.volume);
    };
    const onEnd = () => {
      setPlaying(false);
      setControls(true);
      onEndedRef.current?.();
    };
    const onErr = () => {
      setPlaying(false);
      setError("This lecture couldn’t load. Try another one, or refresh.");
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVol);
    video.addEventListener("ended", onEnd);
    video.addEventListener("error", onErr);
    video.addEventListener("progress", onTime);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVol);
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("error", onErr);
      video.removeEventListener("progress", onTime);
    };
  }, [initialTime, sourceKey]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setStarted(true);
      setPlaying(true);
      try {
        await video.play();
      } catch {
        setPlaying(false);
        setError("The browser blocked playback. Click play again.");
      }
    } else {
      video.pause();
    }
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), video.duration || 0);
  }, []);

  const seekToRatio = useCallback((ratio: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.min(Math.max(0, ratio), 1) * video.duration;
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          void togglePlay();
          break;
        case "arrowleft":
        case "j":
          event.preventDefault();
          seekBy(event.key.toLowerCase() === "j" ? -10 : -5);
          break;
        case "arrowright":
        case "l":
          event.preventDefault();
          seekBy(event.key.toLowerCase() === "l" ? 10 : 5);
          break;
        case "arrowup":
          event.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          video.muted = false;
          break;
        case "arrowdown":
          event.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case "m":
          video.muted = !video.muted;
          break;
        case "f":
          event.preventDefault();
          if (document.fullscreenElement) void document.exitFullscreen();
          else void shellRef.current?.requestFullscreen();
          break;
        default:
          if (event.key >= "0" && event.key <= "9" && video.duration) {
            video.currentTime = (Number(event.key) / 10) * video.duration;
          }
      }
      showControls();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seekBy, showControls, togglePlay]);

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed as (typeof SPEEDS)[number]) + 1) % SPEEDS.length] ?? 1;
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  const progressPct = duration ? (current / duration) * 100 : 0;
  const bufferPct = duration ? (buffered / duration) * 100 : 0;
  const showPoster = Boolean(poster) && !started;
  const showBigPlay = !playing;
  const firstSrc = sources[0]?.src ?? "";
  const embed = firstSrc ? embedSrc(parseVideoUrl(firstSrc)) : null;

  if (embed) {
    return (
      <div className={cn("overflow-hidden rounded-md bg-header", className)}>
        <iframe
          src={embed}
          title={title}
          className="aspect-video w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "group relative isolate overflow-hidden rounded-md bg-header text-on-header",
        className,
      )}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControls(false)}
    >
      <video
        ref={videoRef}
        className="aspect-video w-full bg-header object-contain"
        playsInline
        preload="auto"
        poster={poster}
        aria-label={title}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>

      {showPoster ? (
        <img
          src={poster}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      ) : null}

      <button
        type="button"
        onClick={() => void togglePlay()}
        className={cn(
          "absolute inset-0 z-10 grid place-items-center transition-opacity duration-150",
          showBigPlay ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label={playing ? "Pause" : "Play preview"}
      >
        <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-fg shadow-soft">
          <Play className="size-6 translate-x-0.5" fill="currentColor" />
        </span>
      </button>

      {error ? (
        <p className="absolute inset-x-0 top-3 z-30 mx-auto max-w-md rounded-sm bg-header/80 px-3 py-2 text-center text-sm text-on-header">
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-header via-header/50 to-transparent px-3 pt-16 pb-3 transition-opacity duration-200",
          started && controls ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <label className="relative block h-1.5 cursor-pointer">
          <span className="absolute inset-0 overflow-hidden rounded-full bg-on-header/20">
            <span
              className="absolute inset-y-0 left-0 bg-on-header/30"
              style={{ width: `${bufferPct}%` }}
            />
            <span
              className="absolute inset-y-0 left-0 bg-primary"
              style={{ width: `${progressPct}%` }}
            />
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progressPct * 10)}
            onChange={(event) => seekToRatio(Number(event.target.value) / 1000)}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
            aria-label="Seek"
          />
        </label>

        <div className="mt-2 flex items-center gap-1 text-on-header">
          <IconBtn label={playing ? "Pause" : "Play"} onClick={() => void togglePlay()}>
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </IconBtn>
          <IconBtn label="Back 10 seconds" onClick={() => seekBy(-10)}>
            <SkipBack className="size-4" />
          </IconBtn>
          <IconBtn label="Forward 10 seconds" onClick={() => seekBy(10)}>
            <SkipForward className="size-4" />
          </IconBtn>
          <IconBtn
            label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              video.muted = !video.muted;
            }}
          >
            {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </IconBtn>
          <label className="hidden w-20 sm:block">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : Math.round(volume * 100)}
              onChange={(event) => {
                const video = videoRef.current;
                if (!video) return;
                const next = Number(event.target.value) / 100;
                video.volume = next;
                video.muted = next === 0;
              }}
              className="h-1 w-full cursor-pointer accent-primary"
            />
          </label>
          <span className="ml-1 font-mono text-xs tabular-nums text-on-header/70">
            {formatDuration(current)} / {formatDuration(duration)}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleSpeed}
              className="h-9 rounded-md px-2 font-mono text-xs text-on-header/80 hover:bg-on-header/10 hover:text-on-header"
            >
              {speed}x
            </button>
            <IconBtn
              label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void shellRef.current?.requestFullscreen();
              }}
            >
              {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </IconBtn>
          </span>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md text-on-header hover:bg-on-header/10"
    >
      {children}
    </button>
  );
}
