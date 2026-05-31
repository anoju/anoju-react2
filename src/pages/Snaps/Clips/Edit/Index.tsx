import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { Button, FixedBottomActions, Img, Input, PageLoading, TextArea, VideoPlayer, toast } from '@/components';
import { clipApi, getClipPosterUrl, getClipVideoUrl, getUserMessage } from '@/apis';
import { CLIPS_PATH } from '@/constants/app';
import type { ClipRecord } from '@/types/domain';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useAuthStore } from '@/stores/authStore';
import { canEditAuthoredRecord } from '@/utils/recordPermission';
import {
  UPLOAD_LIMITS,
  createUploadPreviews,
  revokeUploadPreviews,
  type UploadPreview,
} from '@/utils/uploadPolicy';

const ClipsEdit = () => {
  const { clipId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [clip, setClip] = useState<ClipRecord | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterPreview, setPosterPreview] = useState<UploadPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = Boolean(
    clip && (title !== clip.title || description !== clip.description || posterPreview),
  );
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(
    () => () => {
      revokeUploadPreviews(posterPreview ? [posterPreview] : []);
    },
    [posterPreview],
  );

  useEffect(() => {
    if (!clipId) {
      setError('Clips 영상을 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    void clipApi
      .getClip(clipId)
      .then((nextClip) => {
        setClip(nextClip);
        setTitle(nextClip.title);
        setDescription(nextClip.description);
      })
      .catch((loadError) => setError(getUserMessage(loadError)))
      .finally(() => setLoading(false));
  }, [clipId]);

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

  const handlePosterRemove = () => {
    revokeUploadPreviews(posterPreview ? [posterPreview] : []);
    setPosterPreview(null);
  };

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(`${CLIPS_PATH}/${clipId}`);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast('제목과 설명을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const nextClip = await clipApi.updateClip({
        clipId,
        title,
        description,
        posterFile: posterPreview?.file,
      });

      toast('Clips를 수정했습니다.', { tone: 'success' });
      navigate(`${CLIPS_PATH}/${nextClip.id}`, { replace: true });
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading label="Clips를 불러오고 있습니다." />;
  }

  if (error || !clip) {
    return (
      <section className="container write-page">
        <p className="board-page__message">{error ?? 'Clips 영상을 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={CLIPS_PATH}>
          목록으로
        </Link>
      </section>
    );
  }

  if (!canEditAuthoredRecord(clip, user)) {
    return (
      <section className="container write-page">
        <p className="board-page__message">수정 권한이 없습니다.</p>
        <Link className="button-link" to={`${CLIPS_PATH}/${clip.id}`}>
          상세로
        </Link>
      </section>
    );
  }

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">Clips</span>
        <h2>Clips 수정</h2>
        <p>제목, 설명, 썸네일을 수정합니다. 동영상 파일은 유지됩니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <VideoPlayer src={getClipVideoUrl(clip)} poster={posterPreview?.url ?? getClipPosterUrl(clip)} title={title} />

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

        <label className="image-uploader">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterChange} />
          <span>
            <ImagePlus size={18} /> 썸네일 변경
          </span>
        </label>

        <Input label="제목" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
        <TextArea label="설명" value={description} onChange={(event) => setDescription(event.target.value)} rows={6} required />

        <FixedBottomActions>
          <Button type="button" variant="outline" tone="neutral" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            저장
          </Button>
        </FixedBottomActions>
      </form>
    </section>
  );
};

export default ClipsEdit;
