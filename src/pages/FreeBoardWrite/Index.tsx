import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { Button, Img, Input, TextArea, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { FREE_BOARD_PATH } from '@/constants/app';
import { createUploadPreviews, revokeUploadPreviews, type UploadPreview } from '@/utils/uploadPolicy';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const FreeBoardWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const dirty = Boolean(title.trim() || content.trim() || previews.length > 0);
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

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
    setContent((currentContent) => `${currentContent}${currentContent ? '\n\n' : ''}${nextPreviews.map((preview) => `[[image:${preview.id}]]`).join('\n\n')}`);
    event.target.value = '';
  };

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(FREE_BOARD_PATH);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast('제목과 본문을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const post = await communityApi.createPost({
        title: title.trim(),
        content,
        type: 'board',
        imageFiles: previews,
      });

      toast('게시글을 등록했습니다.', { tone: 'success' });
      navigate(`${FREE_BOARD_PATH}/${post.id}`, { replace: true });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">자유게시판</span>
        <h2>글쓰기</h2>
        <p>본문 원하는 위치에 이미지 토큰을 넣어 함께 등록할 수 있습니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <Input label="제목" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required />
        <TextArea
          label="본문"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={12}
          description="이미지를 첨부하면 본문에 이미지 위치 토큰이 추가됩니다. 토큰 위치를 옮기면 이미지 위치도 함께 바뀝니다."
          required
        />

        <label className="image-uploader">
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImagesChange} />
          <span>
            <ImagePlus size={18} /> 본문 이미지 첨부
          </span>
        </label>

        {previews.length > 0 ? (
          <div className="write-page__previews">
            {previews.map((preview) => (
              <figure key={preview.id}>
                <Img src={preview.url} alt={preview.alt} />
                <figcaption>{preview.alt}</figcaption>
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

export default FreeBoardWrite;
