import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { getUserMessage, picLogApi } from '@/apis';
import { Button, FixedBottomActions, Img, Input, TextArea, toast } from '@/components';
import { PIC_LOG_PATH } from '@/constants/app';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { createUploadPreviews, revokeUploadPreviews, type UploadPreview } from '@/utils/uploadPolicy';
import { getChapterLabel, getPicLogEntryImageUrl } from '../data';

const PicLogEdit = () => {
  const { logId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entryId = searchParams.get('entryId') ?? '';
  const [chapter, setChapter] = useState('08:00');
  const [memo, setMemo] = useState('');
  const [alt, setAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dirty = loaded && Boolean(preview || memo.trim() || alt.trim());
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(() => {
    if (!entryId) {
      return;
    }

    picLogApi
      .getEntry(entryId)
      .then((entry) => {
        setChapter(entry.chapter);
        setMemo(entry.memo ?? '');
        setAlt(entry.alt ?? '');
        setImageUrl(getPicLogEntryImageUrl(entry));
        setLoaded(true);
      })
      .catch((error) => toast(getUserMessage(error), { tone: 'danger' }));
  }, [entryId]);

  useEffect(
    () => () => {
      if (preview) {
        revokeUploadPreviews([preview]);
      }
    },
    [preview],
  );

  const resolvedAlt = useMemo(() => alt.trim() || memo.trim().slice(0, 40) || 'picLog 사진', [alt, memo]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);

    if (!file) {
      return;
    }

    const [nextPreview] = createUploadPreviews([file]);

    if (preview) {
      revokeUploadPreviews([preview]);
    }

    setPreview(nextPreview);
    event.target.value = '';
  };

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(`${PIC_LOG_PATH}/${logId}`);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!entryId) {
      toast('수정할 사진을 찾지 못했습니다.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      await picLogApi.updateEntry({
        entryId,
        chapter,
        alt: resolvedAlt,
        memo: memo.trim(),
        imageFile: preview?.file,
      });
      toast('사진과 메모를 수정했습니다.', { tone: 'success' });
      navigate(`${PIC_LOG_PATH}/${logId}`, { replace: true });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">picLog</span>
        <h2>사진 수정</h2>
        <p>{getChapterLabel(chapter)} 챕터의 사진과 메모를 수정합니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        {preview || imageUrl ? (
          <figure className="pic-log-form-preview">
            <Img src={preview?.url ?? imageUrl} alt={resolvedAlt} />
          </figure>
        ) : null}

        <label className="image-uploader">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          <span>
            <ImagePlus size={18} /> 사진 교체
          </span>
        </label>

        <TextArea label="메모" value={memo} rows={5} onChange={(event) => setMemo(event.target.value)} />
        <Input label="대체 텍스트" value={alt} onChange={(event) => setAlt(event.target.value)} />

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

export default PicLogEdit;
