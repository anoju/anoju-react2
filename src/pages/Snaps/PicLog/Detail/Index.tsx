import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CalendarDays, Check, ImagePlus, MessageCircle, Plus, Repeat2, Send, X } from 'lucide-react';
import { getUserMessage, picLogApi } from '@/apis';
import { Avatar, Button, Dialog, EmptyState, IconButton, Img, TextArea, toast } from '@/components';
import { PIC_LOG_PATH } from '@/constants/app';
import { useAuthStore } from '@/stores/authStore';
import type { PicLogCommentRecord, PicLogEntryRecord, PicLogOrderRequestRecord } from '@/types/domain';
import { formatRelativeTime } from '@/utils/community';
import { formatMention, normalizeNickname } from '@/utils/nickname';
import {
  formatPicLogDate,
  getChapterLabel,
  getParticipantsFromLog,
  getPicLogEntryImageUrl,
  getPicLogParticipant,
  getVisibleChapters,
  getVisiblePicLogDates,
  sortEntriesByParticipantOrder,
  type PicLogBundle,
} from '../data';

interface PreviewImage {
  src: string;
  alt: string;
  title: string;
}

const PicLogDetail = () => {
  const { logId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [bundle, setBundle] = useState<PicLogBundle | null>(null);
  const [comments, setComments] = useState<PicLogCommentRecord[]>([]);
  const [activeChapter, setActiveChapter] = useState('');
  const [commentValue, setCommentValue] = useState('');
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: false });
  const commentFormRef = useRef<HTMLFormElement>(null);
  const currentUserId = user?.id ?? '';
  const isAdmin = user?.role === 'admin';

  const loadDetail = useCallback(async () => {
    if (!logId) {
      return;
    }

    setLoading(true);

    try {
      const [log, entries, nextComments, orderRequests] = await Promise.all([
        picLogApi.getLog(logId),
        picLogApi.listEntries(logId),
        picLogApi.listComments(logId),
        picLogApi.listOrderRequests(logId),
      ]);

      setBundle({
        log,
        entries,
        participants: getParticipantsFromLog(log),
        orderRequests,
      });
      setComments(nextComments);
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, [logId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const visibleDates = useMemo(
    () => (bundle ? getVisiblePicLogDates(bundle.entries, bundle.log.logDate) : []),
    [bundle],
  );
  const activeDate = searchParams.get('date') ?? visibleDates[0] ?? bundle?.log.logDate ?? '';
  const visibleChapters = useMemo(
    () => (bundle && activeDate ? getVisibleChapters(bundle.entries, activeDate) : []),
    [activeDate, bundle],
  );

  useEffect(() => {
    if (!visibleChapters.length) {
      setActiveChapter('');
      return;
    }

    setActiveChapter((currentChapter) =>
      (visibleChapters as readonly string[]).includes(currentChapter) ? currentChapter : visibleChapters[0],
    );
  }, [visibleChapters]);

  const handleSelect = useCallback(() => {
    const selectedIndex = emblaApi?.selectedScrollSnap() ?? 0;
    const nextChapter = visibleChapters[selectedIndex];

    if (nextChapter) {
      setActiveChapter(nextChapter);
    }
  }, [emblaApi, visibleChapters]);

  useEffect(() => {
    if (!emblaApi) {
      return undefined;
    }

    emblaApi.on('select', handleSelect);
    emblaApi.on('reInit', handleSelect);

    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('reInit', handleSelect);
    };
  }, [emblaApi, handleSelect]);

  const handleDateClick = (dateKey: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('date', dateKey);
    setSearchParams(nextParams);
  };

  const handleCommentIconClick = (authorId: string) => {
    const author = bundle ? getPicLogParticipant(bundle.participants, authorId) : undefined;
    const tagText = author ? `${formatMention(author.nickname)} ` : '';
    setCommentValue((currentValue) => (currentValue.startsWith(tagText) ? currentValue : `${tagText}${currentValue}`));
    commentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bundle || !activeChapter) {
      return;
    }

    if (!isAuthenticated) {
      toast('댓글 작성은 로그인 후 이용할 수 있습니다.', { tone: 'warning' });
      return;
    }

    const content = commentValue.trim();

    if (!content) {
      toast('댓글 내용을 입력해주세요.', { tone: 'warning' });
      return;
    }

    const taggedUser = bundle.participants.find((participant) => {
      const mention = formatMention(normalizeNickname(participant.nickname));
      return content === mention || content.startsWith(`${mention} `);
    });

    try {
      await picLogApi.createComment({
        logId: bundle.log.id,
        chapter: activeChapter,
        content,
        taggedUserId: taggedUser?.id,
      });
      setCommentValue('');
      toast('댓글을 남겼습니다.', { tone: 'success' });
      setComments(await picLogApi.listComments(bundle.log.id));
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    }
  };

  const handleOrderRequest = async (targetUserId: string) => {
    if (!bundle || targetUserId === currentUserId) {
      return;
    }

    const existingRequest = bundle.orderRequests.find(
      (request) =>
        request.status === 'pending' &&
        request.requester === currentUserId &&
        request.targetUser === targetUserId,
    );

    if (existingRequest) {
      toast('이미 순서 변경 요청을 보냈습니다.', { tone: 'info' });
      return;
    }

    try {
      await picLogApi.createOrderRequest({ logId: bundle.log.id, targetUserId });
      toast('순서 변경 요청을 보냈습니다.', { tone: 'success' });
      await loadDetail();
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    }
  };

  const handleOrderResponse = async (request: PicLogOrderRequestRecord, accepted: boolean) => {
    try {
      await picLogApi.respondOrderRequest(request, accepted);
      toast(accepted ? '순서를 변경했습니다.' : '순서 변경 요청을 거절했습니다.', {
        tone: accepted ? 'success' : 'info',
      });
      await loadDetail();
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    }
  };

  if (loading) {
    return (
      <section className="container pic-log-detail">
        <EmptyState title="picLog를 불러오는 중입니다." />
      </section>
    );
  }

  if (!bundle) {
    return (
      <section className="container pic-log-detail">
        <EmptyState title="picLog를 찾을 수 없습니다." description="목록에서 다시 선택해주세요." />
        <Link to={PIC_LOG_PATH} className="button-link">
          picLog 목록
        </Link>
      </section>
    );
  }

  const { log, entries, participants } = bundle;
  const participantOrder = log.participantOrder.length > 0 ? log.participantOrder : log.participants;
  const pendingRequests = bundle.orderRequests.filter(
    (request) => request.status === 'pending' && request.targetUser === currentUserId,
  );
  const visibleChapterSlides = visibleChapters.length > 0 ? visibleChapters : [''];
  const getAddPath = () => `${PIC_LOG_PATH}/${log.id}/add`;
  const renderSlot = (participantId: string, chapter?: string, entry?: PicLogEntryRecord) => {
    const participant = getPicLogParticipant(participants, participantId);

    if (!participant) {
      return null;
    }

    const canEdit = entry ? isAdmin || entry.author === currentUserId : false;
    const imageUrl = entry ? getPicLogEntryImageUrl(entry) : '';

    return (
      <article key={`${chapter ?? 'empty'}-${participant.id}`} className="pic-log-entry" data-empty={!entry || undefined}>
        {entry ? (
          <>
            <button
              type="button"
              className="pic-log-entry__image-button"
              onClick={() =>
                setPreviewImage({
                  src: imageUrl,
                  alt: entry.alt || `${participant.name} picLog 사진`,
                  title: `${participant.name} ${entry.chapter}`,
                })
              }
            >
              <Img src={imageUrl} alt={entry.alt || 'picLog 사진'} />
              <span className="pic-log-entry__avatar">
                <Avatar src={participant.avatarUrl} name={participant.name} size="sm" />
                <span>{participant.name}</span>
              </span>
              <span className="pic-log-entry__overlay">
                <strong>{entry.chapter}</strong>
                {entry.memo ? <span>{entry.memo}</span> : null}
              </span>
            </button>
            <div className="pic-log-entry__quick-actions" aria-label={`${participant.name} 사진 액션`}>
              <IconButton
                label={`${participant.name}에게 댓글 쓰기`}
                icon={<MessageCircle size={17} />}
                variant="soft"
                tone="neutral"
                size="sm"
                onClick={() => handleCommentIconClick(entry.author)}
              />
              {canEdit ? (
                <IconButton
                  label="사진과 메모 수정"
                  icon={<ImagePlus size={17} />}
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  onClick={() => navigate(`${PIC_LOG_PATH}/${log.id}/edit?entryId=${entry.id}`)}
                />
              ) : null}
              {participant.id !== currentUserId ? (
                <IconButton
                  label={`${participant.name}에게 순서 변경 요청`}
                  icon={<Repeat2 size={17} />}
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  onClick={() => void handleOrderRequest(participant.id)}
                />
              ) : null}
            </div>
          </>
        ) : (
          <Link to={getAddPath()} className="pic-log-entry__empty-link" aria-label={`${participant.name} 사진 등록`}>
            <Plus size={30} />
          </Link>
        )}
      </article>
    );
  };

  return (
    <section className="container pic-log-detail">
      <header className="pic-log-detail__header">
        <span className="board-page__eyebrow">picLog</span>
        <h2>{log.title}</h2>
        <p>사진이 있는 날짜와 시간 챕터만 표시됩니다.</p>
      </header>

      <div className="pic-log-date-tabs" aria-label="picLog 날짜 이동">
        {visibleDates.map((dateKey) => (
          <button
            key={dateKey}
            type="button"
            data-active={dateKey === activeDate}
            onClick={() => handleDateClick(dateKey)}
          >
            <CalendarDays size={15} />
            {formatPicLogDate(dateKey)}
          </button>
        ))}
      </div>

      {pendingRequests.length > 0 ? (
        <section className="pic-log-requests" aria-label="받은 순서 변경 요청">
          {pendingRequests.map((request) => {
            const requester = getPicLogParticipant(participants, request.requester);

            return (
              <div key={request.id} className="pic-log-request">
                <p>
                  <strong>{requester?.name ?? '참여자'}</strong> 님이 순서 변경을 요청했습니다.
                </p>
                <div>
                  <IconButton
                    label="순서 변경 수락"
                    icon={<Check size={17} />}
                    variant="soft"
                    tone="success"
                    size="sm"
                    onClick={() => void handleOrderResponse(request, true)}
                  />
                  <IconButton
                    label="순서 변경 취소"
                    icon={<X size={17} />}
                    variant="soft"
                    tone="danger"
                    size="sm"
                    onClick={() => void handleOrderResponse(request, false)}
                  />
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <div className="pic-log-chapters" aria-label="시간 챕터">
        {visibleChapters.length > 0 ? (
          <div className="pic-log-chapter-dots" aria-label="시간 챕터 위치">
            {visibleChapters.map((chapter, index) => (
              <button
                key={chapter}
                type="button"
                aria-current={activeChapter === chapter}
                onClick={() => emblaApi?.scrollTo(index)}
              >
                {getChapterLabel(chapter)}
              </button>
            ))}
          </div>
        ) : null}

        <div className="pic-log-chapters__viewport" ref={emblaRef}>
          <div className="pic-log-chapters__track">
            {visibleChapterSlides.map((chapter) => {
              const chapterEntries = chapter
                ? sortEntriesByParticipantOrder(
                    entries.filter((entry) => entry.logDate === activeDate && entry.chapter === chapter),
                    participantOrder,
                  )
                : [];
              const chapterComments = comments.filter((comment) => comment.chapter === chapter);

              return (
                <article key={chapter || 'empty'} className="pic-log-chapter">
                  <header className="pic-log-chapter__header">
                    <strong>{chapter ? getChapterLabel(chapter) : formatPicLogDate(log.logDate)}</strong>
                    <span>{chapterEntries.length > 0 ? `${chapterEntries.length}장의 사진` : '첫 사진 대기 중'}</span>
                  </header>

                  <div className="pic-log-entry-list">
                    {participantOrder.map((participantId) => {
                      const entry = chapterEntries.find((item) => item.author === participantId);
                      return renderSlot(participantId, chapter || undefined, entry);
                    })}
                  </div>

                  {chapter ? (
                    <section className="comment-box" aria-label={`${getChapterLabel(chapter)} 댓글`}>
                      <h3>
                        <MessageCircle size={18} /> 댓글 {chapterComments.length}
                      </h3>
                      {chapterComments.length > 0 ? (
                        <div className="comment-box__list">
                          {chapterComments.map((comment) => {
                            const author = getPicLogParticipant(participants, comment.author);
                            const taggedUser = comment.taggedUser
                              ? getPicLogParticipant(participants, comment.taggedUser)
                              : undefined;

                            return (
                              <article key={comment.id} className="comment-item">
                                <div className="comment-item__header">
                                  <div className="comment-item__author">
                                    <Avatar src={author?.avatarUrl} name={author?.name ?? '참여자'} size="sm" />
                                    <div className="comment-item__meta">
                                      <strong>{author?.name ?? '참여자'}</strong>
                                      <span>{formatRelativeTime(comment.created)}</span>
                                      {taggedUser ? (
                                        <span className="comment-item__badge">{formatMention(taggedUser.nickname)}</span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                                <div className="comment-item__content">
                                  <p>{comment.content}</p>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="board-page__message">아직 이 시간의 댓글이 없습니다.</p>
                      )}
                    </section>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <form ref={commentFormRef} className="comment-box__form pic-log-comment-form" onSubmit={handleCommentSubmit}>
        <TextArea
          label={activeChapter ? `${getChapterLabel(activeChapter)} 댓글` : '댓글'}
          value={commentValue}
          onChange={(event) => setCommentValue(event.target.value)}
          rows={3}
          placeholder="사진의 댓글 버튼을 누르면 사용자 태그가 자동으로 들어갑니다."
        />
        <Button type="submit" rightIcon={<Send size={16} />}>
          댓글 등록
        </Button>
      </form>

      <Link to={`${PIC_LOG_PATH}/${log.id}/add`} className="pic-log-add-link">
        <Plus size={18} />
        사진 추가
      </Link>

      <Dialog open={Boolean(previewImage)} title={previewImage?.title} onClose={() => setPreviewImage(null)}>
        {previewImage ? (
          <figure className="pic-log-preview">
            <Img src={previewImage.src} alt={previewImage.alt} />
          </figure>
        ) : null}
      </Dialog>
    </section>
  );
};

export default PicLogDetail;
