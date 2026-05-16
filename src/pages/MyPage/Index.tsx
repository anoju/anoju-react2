import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, confirm, toast } from '@/components';
import { authApi, getUserMessage } from '@/apis';
import { DEFAULT_HOME_PATH } from '@/constants/app';
import { useAuthStore } from '@/stores/authStore';

const MyPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(user?.name ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await authApi.updateProfile({ name: name.trim() || undefined });
      toast('내 정보가 저장되었습니다.', { tone: 'success' });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerificationRequest = async () => {
    if (!user?.email) {
      toast('이메일 정보가 없습니다.', { tone: 'warning' });
      return;
    }

    try {
      await authApi.requestEmailVerification(user.email);
      toast('이메일 인증 메일을 발송했습니다.', { tone: 'success' });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm('로그아웃하시겠습니까?', {
      title: '로그아웃',
      confirmLabel: '로그아웃',
    });

    if (!confirmed) {
      return;
    }

    authApi.logout();
    toast('로그아웃되었습니다.', { tone: 'success' });
    navigate(DEFAULT_HOME_PATH, { replace: true });
  };

  return (
    <section className="container my-page">
      <header className="my-page__header">
        <h2>마이페이지</h2>
        <p>{user?.name ?? user?.email ?? '사용자'}님의 정보를 확인하고 수정합니다.</p>
      </header>

      <dl className="my-page__summary">
        <div>
          <dt>이메일</dt>
          <dd>{user?.email ?? '-'}</dd>
        </div>
        <div>
          <dt>권한</dt>
          <dd>{user?.role ?? 'user'}</dd>
        </div>
        <div>
          <dt>이메일 인증</dt>
          <dd>{user?.verified ? '완료' : '필요'}</dd>
        </div>
      </dl>

      <form className="my-page__form" onSubmit={handleSubmit}>
        <Input label="이름" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        <Button type="submit" loading={submitting}>
          내 정보 저장
        </Button>
      </form>

      <div className="my-page__actions">
        {!user?.verified ? (
          <Button type="button" variant="outline" onClick={handleVerificationRequest}>
            이메일 인증 재요청
          </Button>
        ) : null}
        <Button type="button" variant="outline" tone="neutral" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
    </section>
  );
};

export default MyPage;
