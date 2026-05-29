import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Expand,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
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

export const VideoPlayer = ({ src, title, poster, className = '' }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState('1');

  const progressValue = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = Number(playbackRate);
  }, [isMuted, playbackRate, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const syncPlaybackState = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setIsPlaying(!video.paused);
  };

  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      await video.play().catch(() => undefined);
    } else {
      video.pause();
    }

    syncPlaybackState();
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration || video.duration || 0);
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const nextProgress = Number(event.target.value);

    if (!video || !duration) {
      return;
    }

    video.currentTime = (duration * nextProgress) / 100;
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);

    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted((current) => !current);
  };

  const toggleFullscreen = async () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    await root.requestFullscreen().catch(() => undefined);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
      return;
    }

    if (event.key === ' ' || event.key.toLowerCase() === 'k') {
      event.preventDefault();
      void togglePlay();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      seekBy(-SEEK_SECONDS);
      return;
    }

    if (event.key === 'ArrowRight') {
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
    }
  };

  const rootClassName = ['video-player', className].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      data-playing={isPlaying || undefined}
      data-fullscreen={isFullscreen || undefined}
      onKeyDown={handleKeyDown}
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
        onDoubleClick={() => void toggleFullscreen()}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <track kind="captions" />
      </video>

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

      <div className="video-player__controls">
        <input
          className="video-player__progress"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progressValue}
          aria-label="재생 위치"
          onChange={handleProgressChange}
        />

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
            <select
              className="video-player__speed"
              aria-label="재생 속도"
              value={playbackRate}
              onChange={(event) => setPlaybackRate(event.target.value)}
            >
              {PLAYBACK_RATES.map((rate) => (
                <option value={rate} key={rate}>
                  {rate}x
                </option>
              ))}
            </select>
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

      <span className="video-player__shortcut" aria-hidden="true">
        <Expand size={14} /> Space/K 재생, ← → 탐색, M 음소거, F 전체화면
      </span>
    </div>
  );
};
