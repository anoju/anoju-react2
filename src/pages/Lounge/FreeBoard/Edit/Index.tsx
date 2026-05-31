import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, FixedBottomActions, Input, RichTextEditor, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import type { PostRecord } from '@/types/domain';
import { usePageLoadingEffect } from '@/hooks';
import { useUnsavedChanges } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { canEditAuthoredRecord } from '@/utils/recordPermission';
import { FREE_BOARD_CONFIG, type LoungeBoardConfig } from '../../boardConfig';

const getPlainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

interface FreeBoardEditProps {
  config?: LoungeBoardConfig;
}

const FreeBoardEdit = ({ config = FREE_BOARD_CONFIG }: FreeBoardEditProps) => {
  const { postId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [post, setPost] = useState<PostRecord | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = Boolean(post && (title !== post.title || content !== post.content));
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);
  usePageLoadingEffect(loading, '게시글을 불러오고 있습니다.');

  useEffect(() => {
    if (!postId) {
      setError('게시글을 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    void communityApi.getPost(postId)
      .then((nextPost) => {
        if (nextPost.type !== config.type) {
          setError('게시글을 찾을 수 없습니다.');
          return;
        }

        setPost(nextPost);
        setTitle(nextPost.title);
        setContent(nextPost.content);
      })
      .catch((loadError) => setError(getUserMessage(loadError)))
      .finally(() => setLoading(false));
  }, [config.type, postId]);

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(config.getDetailPath(postId));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !getPlainText(content)) {
      toast('제목과 본문을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const nextPost = await communityApi.updatePost({
        postId,
        title: title.trim(),
        content,
      });

      toast('게시글을 수정했습니다.', { tone: 'success' });
      navigate(config.getDetailPath(nextPost.id), { replace: true });
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  if (error || !post) {
    return (
      <section className="container write-page">
        <p className="board-page__message">{error ?? '게시글을 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={config.listPath}>
          목록으로
        </Link>
      </section>
    );
  }

  if (!(config.adminOnlyWrite ? isAdmin : canEditAuthoredRecord(post, user))) {
    return (
      <section className="container write-page">
        <p className="board-page__message">수정 권한이 없습니다.</p>
        <Link className="button-link" to={config.getDetailPath(post.id)}>
          상세로
        </Link>
      </section>
    );
  }

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">{config.title}</span>
        <h2>게시글 수정</h2>
        <p>제목과 본문을 수정합니다. 기존 본문 이미지는 유지됩니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <Input label="제목" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required />
        <RichTextEditor label="본문" value={content} onChange={setContent} required />

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

export default FreeBoardEdit;
