import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { FileVideo, X } from 'lucide-react';
import { Button } from '@/components/atoms';
import { VideoPlayer } from '@/components/molecules/VideoPlayer';
import {
  createVideoUploadPreview,
  formatFileSize,
  formatVideoDuration,
  getVideoUploadPolicyText,
  type VideoUploadOptions,
  type VideoUploadPreview,
} from '@/utils/uploadPolicy';

const MIN_TRIM_DURATION = 5;
const TRIM_STEP = 0.1;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface VideoUploadFieldProps {
  value: VideoUploadPreview | null;
  title: string;
  poster?: string;
  options: VideoUploadOptions;
  trimStart?: number;
  trimEnd?: number;
  uploading?: boolean;
  onChange: (preview: VideoUploadPreview) => void;
  onRemove: () => void;
  onTrimChange?: (range: { start: number; end: number }) => void;
}

export const VideoUploadField = ({
  value,
  title,
  poster,
  options,
  trimStart = 0,
  trimEnd,
  uploading = false,
  onChange,
  onRemove,
  onTrimChange,
}: VideoUploadFieldProps) => {
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeHandleRef = useRef<'start' | 'end' | 'range' | null>(null);
  const rangeDragOffsetRef = useRef(0);
  const dragStartRangeRef = useRef({ start: 0, end: 0 });

  const handleVideoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextPreview = await createVideoUploadPreview(file, options);

    if (nextPreview) {
      onChange(nextPreview);
    }

    event.target.value = '';
  };

  const policyText = getVideoUploadPolicyText(options);
  const maxTrimDuration = options.maxDurationSeconds ?? 30;
  const currentTrimEnd = trimEnd ?? Math.min(value?.duration ?? 0, maxTrimDuration);
  const selectedDuration = Math.max(0, currentTrimEnd - trimStart);
  const canTrim = Boolean(value && onTrimChange);
  const trimValue = value;
  const rangeStyle = useMemo(() => {
    if (!value?.duration) {
      return { left: '0%', width: '0%' };
    }

    const left = (trimStart / value.duration) * 100;
    const width = (selectedDuration / value.duration) * 100;

    return { left: `${left}%`, width: `${width}%` };
  }, [selectedDuration, trimStart, value?.duration]);

  useEffect(() => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || !value) {
      return;
    }

    previewVideo.currentTime = trimStart;
  }, [trimStart, value]);

  useEffect(() => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || !value) {
      return undefined;
    }

    const handleTimeUpdate = () => {
      if (previewVideo.currentTime >= currentTrimEnd) {
        previewVideo.currentTime = trimStart;
        void previewVideo.play().catch(() => undefined);
      }
    };

    previewVideo.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      previewVideo.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentTrimEnd, trimStart, value]);

  const getSteppedTime = (time: number) => Math.round(time / TRIM_STEP) * TRIM_STEP;

  const updateTrimRange = (nextStart: number, nextEnd: number) => {
    if (!value || !onTrimChange) {
      return;
    }

    const duration = Math.max(value.duration, MIN_TRIM_DURATION);
    const start = clamp(getSteppedTime(nextStart), 0, Math.max(duration - MIN_TRIM_DURATION, 0));
    const end = clamp(getSteppedTime(nextEnd), start + MIN_TRIM_DURATION, Math.min(duration, start + maxTrimDuration));

    onTrimChange({ start, end });
  };

  const updateTrimStart = (nextStart: number) => {
    if (!value || !onTrimChange) {
      return;
    }

    const duration = Math.max(value.duration, MIN_TRIM_DURATION);
    const start = clamp(getSteppedTime(nextStart), 0, Math.max(duration - MIN_TRIM_DURATION, 0));
    const end = clamp(currentTrimEnd, start + MIN_TRIM_DURATION, duration);
    const nextEnd = end - start > maxTrimDuration ? Math.min(duration, start + maxTrimDuration) : end;

    onTrimChange({ start, end: nextEnd });
  };

  const updateTrimEnd = (nextEnd: number) => {
    if (!value || !onTrimChange) {
      return;
    }

    const duration = Math.max(value.duration, MIN_TRIM_DURATION);
    const end = clamp(getSteppedTime(nextEnd), MIN_TRIM_DURATION, duration);
    const start = clamp(trimStart, 0, end - MIN_TRIM_DURATION);
    const nextStart = end - start > maxTrimDuration ? Math.max(0, end - maxTrimDuration) : start;

    onTrimChange({ start: nextStart, end });
  };

  const getTimeFromClientX = (clientX: number) => {
    const track = trackRef.current;

    if (!track || !value?.duration) {
      return 0;
    }

    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);

    return ratio * value.duration;
  };

  const handleTimelinePointerDown = (event: React.PointerEvent<HTMLElement>, handle: 'start' | 'end' | 'range') => {
    if (!value || !onTrimChange) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    trackRef.current?.setPointerCapture(event.pointerId);
    activeHandleRef.current = handle;
    dragStartRangeRef.current = { start: trimStart, end: currentTrimEnd };

    if (handle === 'range') {
      rangeDragOffsetRef.current = getTimeFromClientX(event.clientX) - trimStart;
      return;
    }

    const nextTime = getTimeFromClientX(event.clientX);

    if (handle === 'start') {
      updateTrimStart(nextTime);
    } else {
      updateTrimEnd(nextTime);
    }
  };

  const handleTimelinePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!value || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const activeHandle = activeHandleRef.current;
    const nextTime = getTimeFromClientX(event.clientX);

    if (activeHandle === 'start') {
      updateTrimStart(nextTime);
      return;
    }

    if (activeHandle === 'end') {
      updateTrimEnd(nextTime);
      return;
    }

    if (activeHandle === 'range') {
      const duration = Math.max(MIN_TRIM_DURATION, dragStartRangeRef.current.end - dragStartRangeRef.current.start);
      const nextStart = clamp(nextTime - rangeDragOffsetRef.current, 0, Math.max(value.duration - duration, 0));

      updateTrimRange(nextStart, nextStart + duration);
    }
  };

  const handleTimelinePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activeHandleRef.current = null;
  };

  return (
    <section className="video-upload-field" aria-label="동영상 업로드">
      {value ? (
        <div className="video-upload-field__preview" aria-label="선택한 동영상">
          <VideoPlayer src={value.url} title={title || value.name} poster={poster} />
          <div className="video-upload-field__meta">
            <span>
              {value.name} · {formatFileSize(value.size)} · {formatVideoDuration(value.duration)} · {value.width}x{value.height}
            </span>
            <Button type="button" variant="ghost" tone="danger" size="sm" leftIcon={<X size={16} />} onClick={onRemove}>
              제거
            </Button>
          </div>
        </div>
      ) : null}

      {canTrim && trimValue ? (
        <div className="video-upload-field__trim" aria-label="동영상 구간 선택">
          <video
            ref={previewVideoRef}
            className="video-upload-field__trim-preview"
            src={trimValue.url}
            poster={poster}
            controls
            muted
            playsInline
            preload="metadata"
          />
          <div className="video-upload-field__trim-header">
            <strong>업로드 구간</strong>
            <span>
              {formatVideoDuration(trimStart)} - {formatVideoDuration(currentTrimEnd)} · {formatVideoDuration(selectedDuration)}
            </span>
          </div>
          <div
            ref={trackRef}
            className="video-upload-field__timeline"
            aria-label="업로드 구간 타임라인"
            role="group"
            onPointerMove={handleTimelinePointerMove}
            onPointerUp={handleTimelinePointerUp}
            onPointerCancel={handleTimelinePointerUp}
          >
            <span className="video-upload-field__timeline-track" />
            <span
              className="video-upload-field__timeline-range"
              style={rangeStyle}
              onPointerDown={(event) => handleTimelinePointerDown(event, 'range')}
            >
              <button
                className="video-upload-field__timeline-handle"
                type="button"
                aria-label="시작 시간 조절"
                onPointerDown={(event) => handleTimelinePointerDown(event, 'start')}
              />
              <button
                className="video-upload-field__timeline-handle"
                type="button"
                aria-label="종료 시간 조절"
                onPointerDown={(event) => handleTimelinePointerDown(event, 'end')}
              />
            </span>
          </div>
        </div>
      ) : null}

      <label className="video-upload-field__trigger">
        <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={uploading} onChange={(event) => void handleVideoChange(event)} />
        <span>
          <FileVideo size={18} /> 동영상 선택
        </span>
      </label>

      {policyText ? <p className="video-upload-field__policy">{policyText}</p> : null}
    </section>
  );
};
