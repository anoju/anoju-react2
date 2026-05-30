import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImagePlus, X } from 'lucide-react';
import { Button, FixedBottomActions, Img, Input, TextArea, VideoUploadField, toast } from '@/components';
import { clipApi, getUserMessage } from '@/apis';
import { CLIPS_PATH } from '@/constants/app';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import {
  UPLOAD_LIMITS,
  VIDEO_UPLOAD_PROFILES,
  createUploadPreviews,
  revokeUploadPreviews,
  revokeVideoUploadPreview,
  type UploadPreview,
  type VideoUploadPreview,
} from '@/utils/uploadPolicy';
import { createClientId } from '@/utils/id';

const getThumbnailTimes = ({ start, end }: { start: number; end: number }) => {
  const duration = Math.max(0, end - start);
  const count = duration >= 24 ? 4 : duration >= 12 ? 3 : 2;

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    const insetRatio = 0.08 + ratio * 0.84;

    return start + duration * insetRatio;
  });
};

const captureVideoFrame = async (videoUrl: string, captureTime: number, index: number) => {
  const video = document.createElement('video');
  video.src = videoUrl;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.preload = 'metadata';

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('동영상을 불러오지 못했습니다.'));
  });

  const nextCaptureTime = Math.max(0, Math.min(captureTime, Math.max(video.duration - 0.1, 0)));
  video.currentTime = nextCaptureTime;

  await new Promise<void>((resolve, reject) => {
    video.onseeked = () => resolve();
    video.onerror = () => reject(new Error('썸네일을 추출하지 못했습니다.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));

  if (!blob) {
    throw new Error('썸네일 이미지를 만들지 못했습니다.');
  }

  const file = new File([blob], `clip-thumbnail-${index + 1}.jpg`, {
    type: 'image/jpeg',
  });

  return {
    id: createClientId('clip-poster'),
    file,
    url: URL.createObjectURL(file),
    sortOrder: 0,
    isCover: true,
    alt: `${Math.round(nextCaptureTime * 10) / 10}초 썸네일`,
  } satisfies UploadPreview;
};

const ClipsWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoPreview, setVideoPreview] = useState<VideoUploadPreview | null>(null);
  const [videoTrimRange, setVideoTrimRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: VIDEO_UPLOAD_PROFILES.clips.maxDurationSeconds ?? 30,
  });
  const [posterPreview, setPosterPreview] = useState<UploadPreview | null>(null);
  const [posterCandidates, setPosterCandidates] = useState<UploadPreview[]>([]);
  const [extractingPoster, setExtractingPoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const videoPreviewRef = useRef<VideoUploadPreview | null>(null);
  const posterPreviewRef = useRef<UploadPreview | null>(null);
  const posterCandidatesRef = useRef<UploadPreview[]>([]);
  const dirty = Boolean(title.trim() || description.trim() || videoPreview || posterPreview);
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(() => {
    videoPreviewRef.current = videoPreview;
    posterPreviewRef.current = posterPreview;
    posterCandidatesRef.current = posterCandidates;
  }, [posterCandidates, posterPreview, videoPreview]);

  useEffect(
    () => () => {
      revokeVideoUploadPreview(videoPreviewRef.current);
      revokeUploadPreviews(posterCandidatesRef.current);

      if (!posterCandidatesRef.current.some((candidate) => candidate.id === posterPreviewRef.current?.id)) {
        revokeUploadPreviews(posterPreviewRef.current ? [posterPreviewRef.current] : []);
      }
    },
    [],
  );

  const revokeStandalonePosterPreview = (preview: UploadPreview | null) => {
    if (!preview || posterCandidates.some((candidate) => candidate.id === preview.id)) {
      return;
    }

    revokeUploadPreviews([preview]);
  };

  const createPosterCandidates = async (preview: VideoUploadPreview, range: { start: number; end: number }) => {
    setExtractingPoster(true);

    try {
      const nextCandidates = await Promise.all(
        getThumbnailTimes(range).map((time, index) => captureVideoFrame(preview.url, time, index)),
      );
      revokeStandalonePosterPreview(posterPreview);
      revokeUploadPreviews(posterCandidates);
      setPosterCandidates(nextCandidates);
      setPosterPreview(nextCandidates[0] ?? null);
      toast('썸네일 후보를 만들었습니다.', { tone: 'success' });
    } catch (error) {
      toast(error instanceof Error ? error.message : '썸네일 후보를 만들지 못했습니다.', { tone: 'danger' });
    } finally {
      setExtractingPoster(false);
    }
  };

  const handleVideoChange = async (nextPreview: VideoUploadPreview) => {
    revokeVideoUploadPreview(videoPreview);
    setVideoPreview(nextPreview);
    const nextTrimRange = {
      start: 0,
      end: Math.min(nextPreview.duration, VIDEO_UPLOAD_PROFILES.clips.maxDurationSeconds ?? nextPreview.duration),
    };

    setVideoTrimRange(nextTrimRange);
    await createPosterCandidates(nextPreview, nextTrimRange);
  };

  const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextPreview = createUploadPreviews([file], UPLOAD_LIMITS.clipPoster)[0] ?? null;

    if (nextPreview) {
      revokeStandalonePosterPreview(posterPreview);
      setPosterPreview(nextPreview);
    }

    event.target.value = '';
  };

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(CLIPS_PATH);
    }
  };

  const handleVideoRemove = () => {
    revokeVideoUploadPreview(videoPreview);
    setVideoPreview(null);
    setVideoTrimRange({ start: 0, end: VIDEO_UPLOAD_PROFILES.clips.maxDurationSeconds ?? 30 });
    revokeStandalonePosterPreview(posterPreview);
    setPosterPreview(null);
    revokeUploadPreviews(posterCandidates);
    setPosterCandidates([]);
  };

  const handlePosterRemove = () => {
    revokeStandalonePosterPreview(posterPreview);
    setPosterPreview(null);
  };

  const handlePosterCandidatesCreate = async () => {
    if (!videoPreview) {
      toast('먼저 동영상을 선택해주세요.', { tone: 'warning' });
      return;
    }

    await createPosterCandidates(videoPreview, videoTrimRange);
  };

  const handlePosterCandidateSelect = (candidate: UploadPreview) => {
    setPosterPreview(candidate);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast('제목을 입력해주세요.', { tone: 'warning' });
      return;
    }

    if (!description.trim()) {
      toast('설명을 입력해주세요.', { tone: 'warning' });
      return;
    }

    if (!videoPreview) {
      toast('Clips 동영상을 선택해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const clip = await clipApi.createClip({
        title,
        description,
        videoFile: videoPreview.file,
        videoTrimStart: videoTrimRange.start,
        videoTrimEnd: videoTrimRange.end,
        posterFile: posterPreview?.file,
      });

      toast('Clips를 등록했습니다.', { tone: 'success' });
      navigate(`${CLIPS_PATH}/${clip.id}`, { replace: true });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">Clips</span>
        <h2>동영상 올리기</h2>
        <p>동영상과 제목, 설명을 등록합니다. 썸네일 이미지는 선택 사항입니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <VideoUploadField
          value={videoPreview}
          title={title}
          poster={posterPreview?.url}
          options={VIDEO_UPLOAD_PROFILES.clips}
          trimStart={videoTrimRange.start}
          trimEnd={videoTrimRange.end}
          uploading={submitting}
          onChange={handleVideoChange}
          onRemove={handleVideoRemove}
          onTrimChange={setVideoTrimRange}
        />

        <Input label="제목" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
        <TextArea
          label="설명"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          placeholder="영상에 대한 설명을 입력해주세요."
          required
        />

        {posterPreview ? (
          <figure className="clip-poster-preview">
            <Img src={posterPreview.url} alt={posterPreview.alt} />
            <figcaption>
              <span>{posterPreview.alt}</span>
              <Button type="button" variant="ghost" tone="danger" size="sm" leftIcon={<X size={16} />} onClick={handlePosterRemove}>
                제거
              </Button>
            </figcaption>
          </figure>
        ) : null}

        <div className="clip-upload-actions">
          <label className="image-uploader">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterChange} />
            <span>
              <ImagePlus size={18} /> 썸네일 선택
            </span>
          </label>
        </div>

        {videoPreview ? (
          <div className="clip-thumbnail-extractor" aria-label="영상 썸네일 추출">
            <div className="clip-thumbnail-extractor__header">
              <span>썸네일 후보</span>
              <Button type="button" variant="outline" tone="neutral" size="sm" loading={extractingPoster} leftIcon={<Camera size={16} />} onClick={() => void handlePosterCandidatesCreate()}>
                썸네일 다시 만들기
              </Button>
            </div>
            {posterCandidates.length > 0 ? (
              <div className="clip-thumbnail-extractor__grid">
                {posterCandidates.map((candidate) => (
                  <button
                    className="clip-thumbnail-extractor__candidate"
                    type="button"
                    key={candidate.id}
                    aria-pressed={posterPreview?.id === candidate.id}
                    data-selected={posterPreview?.id === candidate.id || undefined}
                    onClick={() => handlePosterCandidateSelect(candidate)}
                  >
                    <Img src={candidate.url} alt={candidate.alt} />
                    <span>{candidate.alt}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p>선택 구간에서 썸네일 후보를 만들 수 있습니다.</p>
            )}
          </div>
        ) : null}

        <FixedBottomActions>
          <Button type="button" variant="outline" tone="neutral" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            등록
          </Button>
        </FixedBottomActions>
      </form>
    </section>
  );
};

export default ClipsWrite;
