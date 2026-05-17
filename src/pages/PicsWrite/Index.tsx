import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { Button, Img, Input, TextArea, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { PICS_PATH } from '@/constants/app';
import { createUploadPreviews, revokeUploadPreviews, type UploadPreview } from '@/utils/uploadPolicy';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const PicsWrite = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const dirty = Boolean(caption.trim() || title.trim() || previews.length > 0);
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  const resolvedTitle = useMemo(() => title.trim() || caption.trim().slice(0, 40) || 'Pics', [caption, title]);

  useEffect(
    () => () => {
      revokeUploadPreviews(previews);
    },
    [previews],
  );

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const nextPreviews = createUploadPreviews(files).map((preview, index) => ({
      ...preview,
      sortOrder: previews.length + index,
      isCover: previews.length === 0 && index === 0,
    }));

    setPreviews((currentPreviews) => [...currentPreviews, ...nextPreviews]);
    event.target.value = '';
  };

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(PICS_PATH);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (previews.length === 0) {
      toast('Pics에는 이미지가 최소 1장 필요합니다.', { tone: 'warning' });
      return;
    }

    if (!caption.trim()) {
      toast('캡션을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const post = await communityApi.createPost({
        title: resolvedTitle,
        content: caption.trim(),
        type: 'gallery',
        imageFiles: previews,
      });

      toast('Pics를 등록했습니다.', { tone: 'success' });
      navigate(`${PICS_PATH}/${post.id}`, { replace: true });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">Pics</span>
        <h2>장면 올리기</h2>
        <p>이미지 편집 없이 사진과 캡션을 그대로 올립니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <Input label="제목" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="비워두면 캡션으로 생성됩니다." />
        <TextArea
          label="캡션"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={6}
          required
        />

        <label className="image-uploader">
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImagesChange} />
          <span>
            <ImagePlus size={18} /> 이미지 선택
          </span>
        </label>

        {previews.length > 0 ? (
          <div className="write-page__previews write-page__previews--pics">
            {previews.map((preview) => (
              <figure key={preview.id}>
                <Img src={preview.url} alt={preview.alt} />
                <figcaption>{preview.isCover ? '대표 이미지' : preview.alt}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <div className="write-page__actions">
          <Button type="button" variant="outline" tone="neutral" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            등록
          </Button>
        </div>
      </form>
    </section>
  );
};

export default PicsWrite;
