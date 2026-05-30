import type React from 'react';
import { useEffect, useState } from 'react';
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

const captureVideoFrame = async (videoUrl: string, timeRatio: number) => {
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

  const captureTime = Math.max(0, Math.min(video.duration * timeRatio, Math.max(video.duration - 0.1, 0)));
  video.currentTime = captureTime;

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

  const file = new File([blob], `clip-thumbnail-${Math.round(timeRatio * 100)}.jpg`, {
    type: 'image/jpeg',
  });

  return {
    id: createClientId('clip-poster'),
    file,
    url: URL.createObjectURL(file),
    sortOrder: 0,
    isCover: true,
    alt: file.name,
  } satisfies UploadPreview;
};

const ClipsWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoPreview, setVideoPreview] = useState<VideoUploadPreview | null>(null);
  const [posterPreview, setPosterPreview] = useState<UploadPreview | null>(null);
  const [extractingPoster, setExtractingPoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dirty = Boolean(title.trim() || description.trim() || videoPreview || posterPreview);
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(
    () => () => {
      revokeVideoUploadPreview(videoPreview);
      revokeUploadPreviews(posterPreview ? [posterPreview] : []);
    },
    [posterPreview, videoPreview],
  );

  const handleVideoChange = (nextPreview: VideoUploadPreview) => {
    revokeVideoUploadPreview(videoPreview);
    setVideoPreview(nextPreview);
  };

  const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextPreview = createUploadPreviews([file], UPLOAD_LIMITS.clipPoster)[0] ?? null;

    if (nextPreview) {
      revokeUploadPreviews(posterPreview ? [posterPreview] : []);
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
  };

  const handlePosterRemove = () => {
    revokeUploadPreviews(posterPreview ? [posterPreview] : []);
    setPosterPreview(null);
  };

  const handlePosterExtract = async (timeRatio: number) => {
    if (!videoPreview) {
      toast('먼저 동영상을 선택해주세요.', { tone: 'warning' });
      return;
    }

    setExtractingPoster(true);

    try {
      const nextPreview = await captureVideoFrame(videoPreview.url, timeRatio);
      revokeUploadPreviews(posterPreview ? [posterPreview] : []);
      setPosterPreview(nextPreview);
      toast('영상에서 썸네일을 추출했습니다.', { tone: 'success' });
    } catch (error) {
      toast(error instanceof Error ? error.message : '썸네일을 추출하지 못했습니다.', { tone: 'danger' });
    } finally {
      setExtractingPoster(false);
    }
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
          uploading={submitting}
          onChange={handleVideoChange}
          onRemove={handleVideoRemove}
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
            <span>영상에서 썸네일 추출</span>
            <div>
              <Button type="button" variant="outline" tone="neutral" size="sm" loading={extractingPoster} leftIcon={<Camera size={16} />} onClick={() => void handlePosterExtract(0.1)}>
                초반
              </Button>
              <Button type="button" variant="outline" tone="neutral" size="sm" loading={extractingPoster} leftIcon={<Camera size={16} />} onClick={() => void handlePosterExtract(0.5)}>
                중간
              </Button>
              <Button type="button" variant="outline" tone="neutral" size="sm" loading={extractingPoster} leftIcon={<Camera size={16} />} onClick={() => void handlePosterExtract(0.9)}>
                후반
              </Button>
            </div>
          </div>
        ) : null}

        <Input label="제목" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
        <TextArea
          label="설명"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          placeholder="영상에 대한 설명을 입력해주세요."
          required
        />

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
