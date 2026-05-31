import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock, ImagePlus, Plus, Users } from 'lucide-react';
import { Avatar, Checkbox, FloatingActionButton, FloatingActions, Img, toast } from '@/components';
import { getUserMessage, picLogApi } from '@/apis';
import { LOGIN_PATH, PIC_LOG_NEW_PATH, PIC_LOG_PATH } from '@/constants/app';
import { useAuthStore } from '@/stores/authStore';
import {
  formatPicLogDate,
  getPicLogParticipant,
  getPicLogEntryImageUrl,
  getParticipantsFromLog,
  getVisibilityLabel,
  type PicLogBundle,
} from './data';

const getLatestEntry = (bundle: PicLogBundle) =>
  [...bundle.entries].sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''))[0];

const getCoverEntries = (bundle: PicLogBundle) =>
  [...bundle.entries].sort((a, b) => (b.created ?? '').localeCompare(a.created ?? '')).slice(0, 4);

const getEntryDateLabel = (entry?: { logDate: string; chapter: string }) => {
  if (!entry) {
    return '아직 기록 없음';
  }

  return `${formatPicLogDate(entry.logDate)} ${entry.chapter}`;
};

const PicLog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bundles, setBundles] = useState<PicLogBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const showMyLogs = searchParams.get('mine') === '1';

  const loadLogs = useCallback(async () => {
    setLoading(true);

    try {
      const logs = await picLogApi.listLogs(showMyLogs && user?.id ? `author = "${user.id}"` : undefined);
      const nextBundles = await Promise.all(
        logs.map(async (log) => {
          const [entries, orderRequests] = await Promise.all([
            picLogApi.listEntries(log.id),
            picLogApi.listOrderRequests(log.id),
          ]);

          return {
            log,
            entries,
            participants: getParticipantsFromLog(log),
            orderRequests,
          };
        }),
      );

      setBundles(nextBundles);
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [showMyLogs, user?.id]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const keyword = searchParams.get('keyword')?.trim().toLowerCase() ?? '';

    return bundles
      .filter((bundle) => {
        if (!keyword) {
          return true;
        }

        return bundle.log.title.toLowerCase().includes(keyword);
      })
      .sort((a, b) => {
        const latestA = getLatestEntry(a)?.created ?? a.log.updated ?? a.log.created ?? a.log.logDate ?? '';
        const latestB = getLatestEntry(b)?.created ?? b.log.updated ?? b.log.created ?? b.log.logDate ?? '';
        return latestB.localeCompare(latestA);
      });
  }, [bundles, searchParams]);

  const handleMineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && !isAuthenticated) {
      const redirectParams = new URLSearchParams(searchParams);
      redirectParams.set('mine', '1');
      const redirect = encodeURIComponent(`${location.pathname}?${redirectParams.toString()}`);
      navigate(`${LOGIN_PATH}?redirect=${redirect}`);
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (event.target.checked) {
      nextParams.set('mine', '1');
    } else {
      nextParams.delete('mine');
    }

    setSearchParams(nextParams);
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      toast('picLog 생성은 이메일 인증을 완료한 회원만 가능합니다.', { tone: 'warning' });
    }
  };

  return (
    <section className="container pic-log-page">
      <header className="pic-log-page__header">
        <span className="board-page__eyebrow">Snaps</span>
        <h2>picLog</h2>
        <p>친구들과 같은 하루를 시간별 사진으로 채워보세요.</p>
      </header>

      <div className="content-filter">
        <Checkbox label="내 picLog 보기" checked={showMyLogs} onChange={handleMineChange} />
      </div>

      <div className="pic-log-list" aria-label="picLog 목록">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((bundle) => {
            const { log, participants } = bundle;
            const coverEntries = getCoverEntries(bundle);
            const latestEntry = getLatestEntry(bundle);
            const logParticipantOrder = Array.isArray(log.participantOrder) ? log.participantOrder : [];
            const logParticipants = Array.isArray(log.participants) ? log.participants : [];
            const participantOrder = logParticipantOrder.length > 0 ? logParticipantOrder : logParticipants;

            return (
              <Link key={log.id} to={`${PIC_LOG_PATH}/${log.id}`} className="pic-log-card">
                <div className="pic-log-card__covers" aria-hidden="true">
                  {coverEntries.length > 0 ? (
                    coverEntries.map((entry) => (
                      <Img key={entry.id} src={getPicLogEntryImageUrl(entry)} alt="" />
                    ))
                  ) : (
                    <div className="pic-log-card__empty-cover">
                      <ImagePlus size={24} />
                      <span>첫 사진을 기다리는 방</span>
                    </div>
                  )}
                </div>
                <div className="pic-log-card__body">
                  <div className="pic-log-card__title-row">
                    <strong>{log.title}</strong>
                    <span>{getVisibilityLabel(log.visibility)}</span>
                  </div>
                  <p>{latestEntry ? getEntryDateLabel(latestEntry) : `${formatPicLogDate(log.logDate)} 생성됨`}</p>
                  <div className="pic-log-card__meta">
                    <span>
                      <CalendarDays size={15} /> 최대 14일
                    </span>
                    <span>
                      <Clock size={15} /> {bundle.entries.length}장
                    </span>
                    <span>
                      <Users size={15} /> {participants.length}명
                    </span>
                  </div>
                  <div className="pic-log-card__participants" aria-label="참여자">
                    {participantOrder.map((participantId) => {
                      const participant = getPicLogParticipant(participants, participantId);

                      return participant ? (
                        <Avatar
                          key={participant.id}
                          src={participant.avatarUrl}
                          name={participant.name}
                          size="sm"
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </Link>
            );
          })
        ) : loading ? (
          <div className="pic-log-empty">
            <strong>picLog를 불러오는 중입니다.</strong>
          </div>
        ) : (
          <div className="pic-log-empty">
            <ImagePlus size={28} />
            <strong>보여줄 picLog가 없습니다.</strong>
            <p>방을 만들면 사진 등록 전에도 이곳에 표시됩니다.</p>
          </div>
        )}
      </div>

      <FloatingActions label="picLog 주요 액션">
        {isAuthenticated ? (
          <FloatingActionButton label="picLog 만들기" to={PIC_LOG_NEW_PATH} icon={<Plus size={24} />} />
        ) : (
          <FloatingActionButton label="picLog 만들기" icon={<Plus size={24} />} onClick={handleCreateClick} />
        )}
      </FloatingActions>
    </section>
  );
};

export default PicLog;
