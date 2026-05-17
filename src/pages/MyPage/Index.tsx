import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, SocialLoginButtons, confirm, toast } from '@/components';
import { authApi, getUserMessage } from '@/apis';
import type { LinkedOAuthProvider, SupportedOAuthProvider } from '@/apis/authApi';
import { DEFAULT_HOME_PATH } from '@/constants/app';
import { useOAuthProviders } from '@/hooks/useOAuthProviders';
import { useAuthStore } from '@/stores/authStore';

const MyPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(user?.name ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState<LinkedOAuthProvider[]>([]);
  const [linkedLoading, setLinkedLoading] = useState(true);
  const { providers, loading: providersLoading } = useOAuthProviders();

  const linkedProviderNames = useMemo(
    () => linkedProviders.map((provider) => provider.provider),
    [linkedProviders],
  );

  const loginMethodCount = useMemo(() => {
    const hasEmailLogin = Boolean(user?.email);
    return (hasEmailLogin ? 1 : 0) + linkedProviders.length;
  }, [linkedProviders.length, user?.email]);

  const loadLinkedProviders = useCallback(async () => {
    setLinkedLoading(true);

    try {
      setLinkedProviders(await authApi.listLinkedOAuthProviders());
    } catch {
      setLinkedProviders([]);
    } finally {
      setLinkedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinkedProviders();
  }, [loadLinkedProviders]);

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

  const handleUnlinkProvider = async (provider: SupportedOAuthProvider) => {
    if (loginMethodCount <= 1) {
      toast('마지막 로그인 수단은 해제할 수 없습니다.', { tone: 'warning' });
      return;
    }

    const confirmed = await confirm(`${provider} 계정 연결을 해제하시겠습니까?`, {
      title: '소셜 계정 연결 해제',
      confirmLabel: '해제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await authApi.unlinkOAuthProvider(provider);
      toast('소셜 계정 연결을 해제했습니다.', { tone: 'success' });
      await loadLinkedProviders();
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    }
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

      <section className="my-page__social" aria-labelledby="social-login-title">
        <header className="my-page__section-header">
          <h3 id="social-login-title">연결된 로그인 수단</h3>
          <p>Google, Naver, Kakao 계정을 연결하면 같은 계정으로 로그인할 수 있습니다.</p>
        </header>

        {linkedLoading ? (
          <p className="my-page__muted">연결 상태를 확인하고 있습니다.</p>
        ) : (
          <div className="my-page__provider-list">
            {providers.map((provider) => {
              const linked = linkedProviderNames.includes(provider.name);

              return (
                <div className="my-page__provider" key={provider.name}>
                  <span>{provider.displayName}</span>
                  {linked ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      tone="danger"
                      onClick={() => handleUnlinkProvider(provider.name)}
                    >
                      연결 해제
                    </Button>
                  ) : (
                    <span className="my-page__muted">미연결</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <SocialLoginButtons
          providers={providers}
          loading={providersLoading}
          context="link"
          disabledProviders={linkedProviderNames}
          onSuccess={loadLinkedProviders}
        />
      </section>
    </section>
  );
};

export default MyPage;
