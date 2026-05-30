import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Captions,
  Check,
  Expand,
  FastForward,
  Gauge,
  Loader2,
  Maximize,
  Minimize,
  MoreVertical,
  Pause,
  PictureInPicture,
  Play,
  RotateCcw,
  RotateCw,
  Shrink,
  Subtitles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { IconButton } from '@/components/atoms';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  className?: string;
}

const SEEK_SECONDS = 10;
const PLAYBACK_RATES = ['0.5', '0.75', '1', '1.25', '1.5', '2'];
const CONTROL_HIDE_DELAY = 2600;

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) {
    return '0:00';
  }

  const totalSeconds = Math.max(0, Math.floor(time));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const minuteText = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const secondText = String(seconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${minuteText}:${secondText}` : `${minuteText}:${secondText}`;
};

const getBufferedPercent = (video: HTMLVideoElement | null) => {
  if (!video || !video.duration || video.buffered.length === 0) {
    return 0;
  }

  const end = video.buffered.end(video.buffered.length - 1);
  return Math.min(100, (end / video.duration) * 100);
};

type PictureInPictureDocument = Document & {
  pictureInPictureElement?: Element | null;
  pictureInPictureEnabled?: boolean;
  exitPictureInPicture?: () => Promise<void>;
};

type PictureInPictureVideo = HTMLVideoElement & {
  requestPictureInPicture?: () => Promise<unknown>;
};

type SeekFeedback = {
  direction: 'backward' | 'forward';
  id: number;
};

export const VideoPlayer = ({ src, title, poster, className = '' }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const seekFeedbackTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const lastPointerTapAtRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isAutoplayNext, setIsAutoplayNext] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState('1');
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
  const [seekFeedback, setSeekFeedback] = useState<SeekFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPointerInside, setIsPointerInside] = useState(false);

  const progressValue = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  const showFeedback = useCallback((icon: React.ReactNode) => {
    setFeedback(icon);

    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = window.setTimeout(() => setFeedback(null), 520);
  }, []);

  const showSeekFeedback = useCallback((direction: SeekFeedback['direction']) => {
    setSeekFeedback({ direction, id: Date.now() });

    if (seekFeedbackTimerRef.current) {
      window.clearTimeout(seekFeedbackTimerRef.current);
    }

    seekFeedbackTimerRef.current = window.setTimeout(() => setSeekFeedback(null), 680);
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    if (isPlaying && !settingsOpen) {
      hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), CONTROL_HIDE_DELAY);
    }
  }, [isPlaying, settingsOpen]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }

      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }

      if (seekFeedbackTimerRef.current) {
        window.clearTimeout(seekFeedbackTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.volume = volume;
    video.muted = isMuted;
    video.loop = isLooping;
    video.playbackRate = Number(playbackRate);
  }, [isLooping, isMuted, playbackRate, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const handleEnterPictureInPicture = () => {
      setIsPictureInPicture(true);
      setIsMini(false);
    };
    const handleLeavePictureInPicture = () => {
      setIsPictureInPicture(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPictureInPicture);
    video.addEventListener('leavepictureinpicture', handleLeavePictureInPicture);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPictureInPicture);
      video.removeEventListener('leavepictureinpicture', handleLeavePictureInPicture);
    };
  }, []);

  const syncPlaybackState = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setIsPlaying(!video.paused);
  }, []);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      await video.play().catch(() => undefined);
      showFeedback(<Play size={42} fill="currentColor" />);
    } else {
      video.pause();
      showFeedback(<Pause size={42} fill="currentColor" />);
    }

    syncPlaybackState();
    revealControls();
  }, [revealControls, showFeedback, syncPlaybackState]);

  const seekBy = useCallback((seconds: number, options?: { directionalFeedback?: boolean }) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration || video.duration || 0);
    if (options?.directionalFeedback) {
      showSeekFeedback(seconds > 0 ? 'forward' : 'backward');
    } else {
      showFeedback(seconds > 0 ? <RotateCw size={42} /> : <RotateCcw size={42} />);
    }
    revealControls();
  }, [duration, revealControls, showFeedback, showSeekFeedback]);

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const nextProgress = Number(event.target.value);

    if (!video || !duration) {
      return;
    }

    video.currentTime = (duration * nextProgress) / 100;
    revealControls();
  };

  const handleProgressPointerMove = (event: React.PointerEvent<HTMLInputElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHoverTime(formatTime(duration * ratio));
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);

    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    revealControls();
  };

  const toggleMute = useCallback(() => {
    setIsMuted((current) => !current);
    showFeedback(isMuted ? <Volume2 size={42} /> : <VolumeX size={42} />);
    revealControls();
  }, [isMuted, revealControls, showFeedback]);

  const toggleFullscreen = useCallback(async () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    await root.requestFullscreen().catch(() => undefined);
  }, []);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current as PictureInPictureVideo | null;
    const pictureInPictureDocument = document as PictureInPictureDocument;

    if (!video) {
      return;
    }

    if (pictureInPictureDocument.pictureInPictureElement === video) {
      await pictureInPictureDocument.exitPictureInPicture?.().catch(() => undefined);
      return;
    }

    if (pictureInPictureDocument.pictureInPictureEnabled && video.requestPictureInPicture) {
      if (video.paused) {
        await video.play().catch(() => undefined);
      }

      await video.requestPictureInPicture().catch(() => {
        setIsMini((current) => !current);
      });
      showFeedback(<PictureInPicture size={42} />);
      revealControls();
      return;
    }

    setIsMini((current) => !current);
    showFeedback(<PictureInPicture size={42} />);
    revealControls();
  }, [revealControls, showFeedback]);

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (!isPointerInside && !rootRef.current?.contains(document.activeElement)) {
        return;
      }

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === ' ' || event.key.toLowerCase() === 'k') {
        event.preventDefault();
        void togglePlay();
        return;
      }

      if (event.key.toLowerCase() === 'j' || event.key === 'ArrowLeft') {
        event.preventDefault();
        seekBy(-SEEK_SECONDS);
        return;
      }

      if (event.key.toLowerCase() === 'l' || event.key === 'ArrowRight') {
        event.preventDefault();
        seekBy(SEEK_SECONDS);
        return;
      }

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        toggleMute();
        return;
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        void toggleFullscreen();
        return;
      }

      if (event.key.toLowerCase() === 't') {
        event.preventDefault();
        setIsTheater((current) => !current);
        return;
      }

      if (event.key.toLowerCase() === 'i') {
        event.preventDefault();
        void togglePictureInPicture();
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isPointerInside, seekBy, toggleFullscreen, toggleMute, togglePictureInPicture, togglePlay]);

  const handleTapSeek = useCallback((clientX: number, rect: DOMRect) => {
    const now = Date.now();
    const previous = lastTapRef.current;
    lastTapRef.current = { time: now, x: clientX };

    if (!previous || now - previous.time > 320 || Math.abs(previous.x - clientX) > 96) {
      return false;
    }

    const tappedLeft = clientX < rect.left + rect.width / 2;
    seekBy(tappedLeft ? -SEEK_SECONDS : SEEK_SECONDS, { directionalFeedback: true });
    return true;
  }, [seekBy]);

  const handleDoubleClick = (event: React.MouseEvent<HTMLVideoElement>) => {
    event.preventDefault();

    if (Date.now() - lastPointerTapAtRef.current < 240) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickedLeft = event.clientX < rect.left + rect.width / 2;
    seekBy(clickedLeft ? -SEEK_SECONDS : SEEK_SECONDS, { directionalFeedback: true });
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLVideoElement>) => {
    if (Date.now() - lastPointerTapAtRef.current < 500) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    handleTapSeek(touch.clientX, rect);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLVideoElement>) => {
    if (event.button !== 0) {
      return;
    }

    if (event.pointerType === 'touch') {
      lastPointerTapAtRef.current = Date.now();
      handleTapSeek(event.clientX, event.currentTarget.getBoundingClientRect());
      return;
    }

    const handled = handleTapSeek(event.clientX, event.currentTarget.getBoundingClientRect());

    if (handled) {
      lastPointerTapAtRef.current = Date.now();
    }
  };

  const shellClassName = ['video-player-shell', className].filter(Boolean).join(' ');

  return (
    <div className={shellClassName} data-theater={isTheater || undefined} data-mini={isMini || undefined}>
      <div
        ref={rootRef}
        className="video-player"
        data-playing={isPlaying || undefined}
        data-controls-visible={controlsVisible || undefined}
        data-fullscreen={isFullscreen || undefined}
        data-theater={isTheater || undefined}
        data-mini={isMini || undefined}
        data-pip={isPictureInPicture || undefined}
        data-loading={loading || undefined}
        onPointerEnter={() => {
          setIsPointerInside(true);
          revealControls();
        }}
        onPointerLeave={() => setIsPointerInside(false)}
        onPointerMove={revealControls}
        tabIndex={0}
      >
      <video
        ref={videoRef}
        className="video-player__media"
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        onClick={() => void togglePlay()}
        onDoubleClick={handleDoubleClick}
        onPointerUp={handlePointerUp}
        onTouchEnd={handleTouchEnd}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setBufferedPercent(getBufferedPercent(event.currentTarget));
        }}
        onProgress={(event) => setBufferedPercent(getBufferedPercent(event.currentTarget))}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlay={() => {
          setIsPlaying(true);
          setHasError(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (isAutoplayNext) {
            showFeedback(<FastForward size={42} />);
          }
        }}
        onError={() => {
          setHasError(true);
          setLoading(false);
        }}
      >
        <track kind="captions" />
      </video>

      {loading ? (
        <div className="video-player__loading" aria-label="동영상 로딩 중">
          <Loader2 size={34} />
        </div>
      ) : null}

      {hasError ? (
        <div className="video-player__error" role="status">
          <strong>동영상을 재생할 수 없습니다.</strong>
          <span>파일 형식이나 네트워크 상태를 확인해주세요.</span>
        </div>
      ) : null}

      {feedback ? <div className="video-player__feedback">{feedback}</div> : null}

      {seekFeedback ? (
        <div
          className="video-player__seek-feedback"
          data-direction={seekFeedback.direction}
          key={seekFeedback.id}
          aria-live="polite"
        >
          {seekFeedback.direction === 'backward' ? <RotateCcw size={34} /> : <RotateCw size={34} />}
          <span>{SEEK_SECONDS}초</span>
        </div>
      ) : null}

      {!isPlaying ? (
        <button
          className="video-player__center-button"
          type="button"
          aria-label={`${title} 재생`}
          onClick={() => void togglePlay()}
        >
          <Play size={34} fill="currentColor" />
        </button>
      ) : null}

      <div className="video-player__top-actions" aria-label="동영상 상단 액션">
        <IconButton
          label="더보기"
          icon={<MoreVertical size={18} />}
          size="sm"
          variant="plain"
          tone="neutral"
          onClick={() => {
            setSettingsOpen((current) => !current);
            revealControls();
          }}
        />
      </div>

      <div className="video-player__controls">
        <div className="video-player__progress-wrap">
          <span className="video-player__hover-time">{hoverTime ?? formatTime(currentTime)}</span>
          <progress className="video-player__buffer" max="100" value={bufferedPercent} aria-hidden="true" />
          <input
            className="video-player__progress"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressValue}
            aria-label="재생 위치"
            onChange={handleProgressChange}
            onPointerMove={handleProgressPointerMove}
            onPointerLeave={() => setHoverTime(null)}
          />
        </div>

        <div className="video-player__control-row">
          <div className="video-player__control-group">
            <IconButton
              label={isPlaying ? '일시정지' : '재생'}
              icon={isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={() => void togglePlay()}
            />
            <IconButton
              label={`${SEEK_SECONDS}초 뒤로`}
              icon={<RotateCcw size={18} />}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={() => seekBy(-SEEK_SECONDS)}
            />
            <IconButton
              label={`${SEEK_SECONDS}초 앞으로`}
              icon={<RotateCw size={18} />}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={() => seekBy(SEEK_SECONDS)}
            />
            <span className="video-player__time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="video-player__control-group">
            <div className="video-player__volume-group">
              <IconButton
                label={isMuted ? '음소거 해제' : '음소거'}
                icon={isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                size="sm"
                variant="plain"
                tone="neutral"
                onClick={toggleMute}
              />
              <input
                className="video-player__volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                aria-label="볼륨"
                onChange={handleVolumeChange}
              />
            </div>
            <IconButton
              label={isTheater ? '기본 모드' : '극장 모드'}
              icon={isTheater ? <Shrink size={18} /> : <Expand size={18} />}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={() => setIsTheater((current) => !current)}
            />
            <IconButton
              label={isPictureInPicture || isMini ? 'PIP 종료' : 'PIP 모드'}
              icon={<PictureInPicture size={18} />}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={() => void togglePictureInPicture()}
            />
            <IconButton
              label={isFullscreen ? '전체화면 종료' : '전체화면'}
              icon={isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={() => void toggleFullscreen()}
            />
          </div>
        </div>
      </div>

      {settingsOpen ? (
        <div className="video-player__settings" role="menu" aria-label="동영상 설정">
          <div className="video-player__settings-row">
            <Gauge size={16} />
            <span>재생 속도</span>
          </div>
          <div className="video-player__rate-grid">
            {PLAYBACK_RATES.map((rate) => (
              <button
                type="button"
                data-selected={playbackRate === rate || undefined}
                onClick={() => {
                  setPlaybackRate(rate);
                  revealControls();
                }}
                key={rate}
              >
                {playbackRate === rate ? <Check size={14} /> : null}
                {rate}x
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setIsLooping((current) => !current)}>
            {isLooping ? <Check size={14} /> : null}
            반복 재생
          </button>
          <button type="button" onClick={() => setIsAutoplayNext((current) => !current)}>
            {isAutoplayNext ? <Check size={14} /> : null}
            다음 영상 자동재생
          </button>
          <button type="button" disabled>
            <Captions size={14} />
            자막 준비 중
          </button>
          <button type="button" disabled>
            <Subtitles size={14} />
            화질 자동
          </button>
        </div>
      ) : null}

      <span className="video-player__shortcut" aria-hidden="true">
        K 재생 · J/L 탐색 · M 음소거 · I PIP · T 극장 · F 전체화면
      </span>
      </div>
    </div>
  );
};
