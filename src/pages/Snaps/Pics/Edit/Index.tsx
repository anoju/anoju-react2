import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, FixedBottomActions, Img, PageLoading, TextArea, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import { PICS_PATH } from '@/constants/app';
import type { PostImageRecord, PostRecord } from '@/types/domain';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useAuthStore } from '@/stores/authStore';
import { getPostImageUrl } from '@/utils/community';
import { canEditAuthoredRecord } from '@/utils/recordPermission';

const PicsEdit = () => {
  const { postId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [post, setPost] = useState<PostRecord | null>(null);
  const [images, setImages] = useState<PostImageRecord[]>([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedTitle = useMemo(() => caption.trim().replace(/\s+/g, ' ').slice(0, 40) || 'Pics', [caption]);
  const dirty = Boolean(post && caption !== post.content);
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(() => {
    if (!postId) {
      setError('Pics를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    void Promise.all([communityApi.getPost(postId), communityApi.listImages(postId)])
      .then(([nextPost, nextImages]) => {
        setPost(nextPost);
        setCaption(nextPost.content);
        setImages([...nextImages].sort((a, b) => a.sortOrder - b.sortOrder));
      })
      .catch((loadError) => setError(getUserMessage(loadError)))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(`${PICS_PATH}/${postId}`);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!caption.trim()) {
      toast('캡션을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const nextPost = await communityApi.updatePost({
        postId,
        title: resolvedTitle,
        content: caption.trim(),
      });

      toast('Pics를 수정했습니다.', { tone: 'success' });
      navigate(`${PICS_PATH}/${nextPost.id}`, { replace: true });
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading label="Pics를 불러오고 있습니다." />;
  }

  if (error || !post) {
    return (
      <section className="container write-page">
        <p className="board-page__message">{error ?? 'Pics를 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={PICS_PATH}>
          피드로
        </Link>
      </section>
    );
  }

  if (!canEditAuthoredRecord(post, user)) {
    return (
      <section className="container write-page">
        <p className="board-page__message">수정 권한이 없습니다.</p>
        <Link className="button-link" to={`${PICS_PATH}/${post.id}`}>
          상세로
        </Link>
      </section>
    );
  }

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">Pics</span>
        <h2>Pics 수정</h2>
        <p>캡션을 수정합니다. 이미지는 다음 단계에서 교체와 순서 변경을 확장합니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        {images.length > 0 ? (
          <div className="write-page__previews write-page__previews--pics">
            {images.map((image) => (
              <figure key={image.id}>
                <Img src={getPostImageUrl(image)} alt={image.alt || post.title} />
                <figcaption>{image.isCover ? '대표 이미지' : '등록된 이미지'}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <TextArea
          label="캡션"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={1000}
          rows={8}
          required
        />

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

export default PicsEdit;
