import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { KeyRound, LogIn } from 'lucide-react';
import { getUserMessage, picLogApi } from '@/apis';
import { Button, EmptyState, Input, PageLoading, toast } from '@/components';
import { PIC_LOG_PATH } from '@/constants/app';
import { useAuthStore } from '@/stores/authStore';
import type { PicLogRecord } from '@/types/domain';
import { formatPicLogDate } from '../data';

const PicLogJoin = () => {
  const { logId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [log, setLog] = useState<PicLogRecord | null>(null);
  const [invitePassword, setInvitePassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadLog = useCallback(async () => {
    if (!logId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextLog = await picLogApi.getLog(logId);
      setLog(nextLog);

      if (user?.id && nextLog.participants.includes(user.id)) {
        navigate(`${PIC_LOG_PATH}/${nextLog.id}`, { replace: true });
      }
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
      setLog(null);
    } finally {
      setLoading(false);
    }
  }, [logId, navigate, user?.id]);

  useEffect(() => {
    void loadLog();
  }, [loadLog]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!log) {
      return;
    }

    if (!isAuthenticated) {
      toast('초대 입장은 로그인 후 이용할 수 있습니다.', { tone: 'warning' });
      navigate(`/login?redirect=${encodeURIComponent(`${PIC_LOG_PATH}/${log.id}/join`)}`);
      return;
    }

    const password = invitePassword.trim();

    if (!password) {
      setPasswordError('방 패스워드를 입력해주세요.');
      return;
    }

    setPasswordError('');
    setSubmitting(true);

    try {
      await picLogApi.joinLog({ logId: log.id, invitePassword: password });
      toast('picLog에 입장했습니다.', { tone: 'success' });
      navigate(`${PIC_LOG_PATH}/${log.id}`, { replace: true });
    } catch (error) {
      setPasswordError('패스워드를 다시 확인해주세요.');
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading label="초대 정보를 확인하고 있습니다." />;
  }

  if (!log) {
    return (
      <section className="container pic-log-join">
        <EmptyState title="초대된 picLog를 찾을 수 없습니다." description="링크가 올바른지 확인해주세요." />
      </section>
    );
  }

  return (
    <section className="container pic-log-join">
      <header className="pic-log-join__header">
        <span className="board-page__eyebrow">picLog 초대</span>
        <h2>{log.title}</h2>
        <p>{formatPicLogDate(log.logDate)} 기록에 입장하려면 방 패스워드를 입력해주세요.</p>
      </header>

      <form className="pic-log-join__form" onSubmit={handleSubmit}>
        <Input
          label="방 패스워드"
          value={invitePassword}
          onChange={(event) => {
            setInvitePassword(event.target.value.toUpperCase());
            setPasswordError('');
          }}
          leftIcon={<KeyRound size={17} />}
          error={passwordError}
          autoComplete="off"
          inputMode="text"
          maxLength={12}
          required
        />
        <Button type="submit" loading={submitting} rightIcon={<LogIn size={16} />}>
          입장하기
        </Button>
      </form>
    </section>
  );
};

export default PicLogJoin;
