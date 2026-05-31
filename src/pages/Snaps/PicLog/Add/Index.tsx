import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { getUserMessage, picLogApi } from '@/apis';
import { Button, FixedBottomActions, Img, Input, TextArea, toast } from '@/components';
import { PIC_LOG_PATH } from '@/constants/app';
import { useUnsavedChanges } from '@/hooks';
import { createUploadPreviews, revokeUploadPreviews, type UploadPreview } from '@/utils/uploadPolicy';
import { getChapterLabel, getCurrentPicLogChapter } from '../data';

const PicLogAdd = () => {
  const { logId = '' } = useParams();
  const navigate = useNavigate();
  const [logDate, setLogDate] = useState('');
  const [chapter, setChapter] = useState(() => getCurrentPicLogChapter());
  const [memo, setMemo] = useState('');
  const [alt, setAlt] = useState('');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dirty = Boolean(preview || memo.trim() || alt.trim());
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(() => {
    let mounted = true;
    const currentChapter = getCurrentPicLogChapter();

    setChapter(currentChapter);

    picLogApi
      .getLog(logId)
      .then((log) => {
        if (mounted) {
          setLogDate(log.logDate);
        }
      })
      .catch((error) => toast(getUserMessage(error), { tone: 'danger' }));

    return () => {
      mounted = false;
    };
  }, [logId]);

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

    if (!preview) {
      toast('등록할 사진을 선택해주세요.', { tone: 'warning' });
      return;
    }

    if (!logDate) {
      toast('picLog 날짜를 확인하지 못했습니다.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      await picLogApi.createEntry({
        logId,
        logDate,
        chapter,
        imageFile: preview.file,
        alt: resolvedAlt,
        memo: memo.trim(),
      });
      toast('사진을 추가했습니다.', { tone: 'success' });
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
        <h2>사진 추가</h2>
        <p>현재 시간 기준 {getChapterLabel(chapter)} 챕터에 사진을 남깁니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        {preview ? (
          <figure className="pic-log-form-preview">
            <Img src={preview.url} alt={resolvedAlt} />
          </figure>
        ) : null}

        <label className="image-uploader">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          <span>
            <ImagePlus size={18} /> 사진 선택
          </span>
        </label>

        <TextArea label="메모" value={memo} rows={5} onChange={(event) => setMemo(event.target.value)} />
        <Input label="대체 텍스트" value={alt} onChange={(event) => setAlt(event.target.value)} />

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

export default PicLogAdd;
