import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Avatar, Button, ShareButton, VideoPlayer, confirm, toast } from '@/components';
import { clipApi, getClipPosterUrl, getClipVideoUrl, getUserMessage } from '@/apis';
import { CLIPS_PATH } from '@/constants/app';
import type { ClipRecord } from '@/types/domain';
import { formatRelativeTime, getRecordAuthorAvatarUrl, getRecordAuthorName } from '@/utils/community';
import { canEditAuthoredRecord } from '@/utils/recordPermission';
import { useAuthStore } from '@/stores/authStore';

const ClipsDetail = () => {
  const { clipId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [clip, setClip] = useState<ClipRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClip = useCallback(async () => {
    if (!clipId) {
      setError('Clips 영상을 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextClip = await clipApi.getClip(clipId);
      setClip(nextClip);
    } catch (loadError) {
      setError(getUserMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [clipId]);

  useEffect(() => {
    void loadClip();
  }, [loadClip]);

  const handleHideClip = async () => {
    const confirmed = await confirm('Clips를 목록에서 숨김 처리할까요?', {
      title: 'Clips 삭제 확인',
      confirmLabel: '삭제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const nextClip = await clipApi.hideClip(clipId);
      setClip(nextClip);
      toast('Clips를 숨김 처리했습니다.', { tone: 'success' });
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClipPermanently = async () => {
    const confirmed = await confirm('Clips와 연결된 동영상을 완전히 삭제할까요? 이 작업은 되돌릴 수 없습니다.', {
      title: '완전 삭제 확인',
      confirmLabel: '완전 삭제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await clipApi.deleteClipPermanently(clipId);
      toast('Clips를 완전히 삭제했습니다.', { tone: 'success' });
      navigate(CLIPS_PATH, { replace: true });
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <section className="container clips-detail">Clips를 불러오고 있습니다.</section>;
  }

  if (error || !clip) {
    return (
      <section className="container clips-detail">
        <p className="board-page__message">{error ?? 'Clips 영상을 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={CLIPS_PATH}>
          목록으로
        </Link>
      </section>
    );
  }

  const posterUrl = getClipPosterUrl(clip);
  const shareUrl = new URL(`${CLIPS_PATH}/${clip.id}`, window.location.origin).toString();
  const canEditClip = canEditAuthoredRecord(clip, user);

  return (
    <article className="container clips-detail">
      <VideoPlayer src={getClipVideoUrl(clip)} poster={posterUrl} title={clip.title} className="clips-detail__player" />

      <section className="clips-detail__content" aria-label="영상 정보">
        <header className="clips-detail__header">
          <Link to={CLIPS_PATH}>Clips</Link>
          <h2>{clip.title}</h2>
          <p>
            <Eye size={16} /> 조회 {clip.viewCount ?? 0}회 · {formatRelativeTime(clip.created)}
          </p>
        </header>

        <div className="clips-detail__channel">
          <Avatar src={getRecordAuthorAvatarUrl(clip)} name={getRecordAuthorName(clip)} size="md" />
          <div>
            <strong>{getRecordAuthorName(clip)}</strong>
            <span>{clip.tags?.map((tag) => `#${tag}`).join(' ') || 'Clips'}</span>
          </div>
          <ShareButton title={clip.title} text={clip.description} url={shareUrl} />
        </div>

        <p className="clips-detail__description">{clip.description}</p>
      </section>

      {canEditClip || isAdmin ? (
        <div className="admin-actions" aria-label="Clips 관리">
          {canEditClip ? (
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              size="lg"
              leftIcon={<Pencil size={18} />}
              onClick={() => navigate(`${CLIPS_PATH}/${clip.id}/edit`)}
            >
              수정
            </Button>
          ) : null}
          {clip.status === 'hidden' || clip.deleted ? (
            isAdmin ? (
              <Button
                type="button"
                variant="outline"
                tone="danger"
                size="lg"
                loading={deleting}
                leftIcon={<Trash2 size={18} />}
                onClick={handleDeleteClipPermanently}
              >
                완전 삭제
              </Button>
            ) : null
          ) : canEditClip ? (
            <Button
              type="button"
              variant="outline"
              tone="danger"
              size="lg"
              loading={deleting}
              leftIcon={<Trash2 size={18} />}
              onClick={handleHideClip}
            >
              삭제
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

export default ClipsDetail;
