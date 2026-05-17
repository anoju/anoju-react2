import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ImagePlus } from 'lucide-react';
import { Button, FixedBottomActions, Img, TextArea, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { PICS_PATH } from '@/constants/app';
import { createUploadPreviews, revokeUploadPreviews, type UploadPreview } from '@/utils/uploadPolicy';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const PicsWrite = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const dirty = Boolean(caption.trim() || previews.length > 0);
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  const resolvedTitle = useMemo(() => caption.trim().replace(/\s+/g, ' ').slice(0, 40) || 'Pics', [caption]);

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

  const handleCoverSelect = (coverId: string) => {
    setPreviews((currentPreviews) =>
      currentPreviews.map((preview) => ({
        ...preview,
        isCover: preview.id === coverId,
      })),
    );
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
        {previews.length > 0 ? (
          <div className="write-page__previews write-page__previews--pics">
            {previews.map((preview) => (
              <figure key={preview.id}>
                <Img src={preview.url} alt={preview.alt} />
                <figcaption>
                  <span>{preview.alt}</span>
                  <button
                    type="button"
                    className="cover-select-btn"
                    data-selected={preview.isCover}
                    onClick={() => handleCoverSelect(preview.id)}
                  >
                    {preview.isCover ? <Check size={14} /> : null}
                    {preview.isCover ? '대표' : '대표로 지정'}
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <label className="image-uploader">
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImagesChange} />
          <span>
            <ImagePlus size={18} /> 이미지 선택
          </span>
        </label>

        <TextArea
          label="캡션"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={6}
          placeholder="사진에 남기고 싶은 이야기를 적어주세요."
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

export default PicsWrite;
