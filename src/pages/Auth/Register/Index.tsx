import { useState } from 'react';
import type React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, SocialLoginButtons, TurnstileWidget, toast } from '@/components';
import { authApi } from '@/apis';
import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@/constants/app';
import { getUserMessage, toAppError } from '@/apis/apiError';
import { useOAuthProviders } from '@/hooks/useOAuthProviders';
import { isNicknameConflictMessage, normalizeNickname, validateNickname } from '@/utils/nickname';

const Register = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { providers, loading: providersLoading } = useOAuthProviders();

  const validate = () => {
    const nextNicknameError = validateNickname(nickname);
    if (nextNicknameError) return nextNicknameError;
    if (!email.trim()) return '이메일을 입력해주세요.';
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 8자 이상 입력해주세요.';
    if (password !== passwordConfirm) return '비밀번호 확인이 일치하지 않습니다.';
    if (!turnstileToken) return '보안 확인을 완료해주세요.';
    return null;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const error = validate();

    if (error) {
      toast(error, { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const normalizedNickname = normalizeNickname(nickname);

      await authApi.register({
        email: email.trim(),
        password,
        passwordConfirm,
        nickname: normalizedNickname,
        turnstileToken,
      });
      toast('회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.', { tone: 'success' });
      navigate(LOGIN_PATH, { replace: true });
    } catch (submitError) {
      const message = getUserMessage(submitError);
      const appError = toAppError(submitError);
      const originalMessage = appError.rawMessage ?? appError.message;

      if (isNicknameConflictMessage(originalMessage)) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        toast('이미 사용 중인 닉네임입니다.', { tone: 'warning' });
        return;
      }

      toast(message, { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container auth-page">
      <header className="auth-page__header">
        <h2>회원가입</h2>
        <p>이메일 인증 후 모든 기능을 이용할 수 있습니다.</p>
      </header>

      <form className="auth-page__form" onSubmit={handleSubmit}>
        <Input
          label="닉네임"
          value={nickname}
          onBlur={() => setNicknameError(validateNickname(nickname))}
          onChange={(event) => {
            setNickname(normalizeNickname(event.target.value));
            setNicknameError('');
          }}
          autoComplete="nickname"
          description="댓글 태그에 사용되며 중복될 수 없습니다."
          error={nicknameError}
          required
        />
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
        <Input
          label="비밀번호 확인"
          type="password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          autoComplete="new-password"
          required
        />
        <TurnstileWidget value={turnstileToken} onChange={setTurnstileToken} />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          회원가입
        </Button>
      </form>

      {providers.length > 0 || providersLoading ? (
        <>
          <div className="auth-page__divider" role="separator">
            <span>또는</span>
          </div>
          <SocialLoginButtons
            providers={providers}
            loading={providersLoading}
            context="register"
            onSuccess={() => navigate(DEFAULT_HOME_PATH, { replace: true })}
          />
        </>
      ) : null}

      <p className="auth-page__link">
        이미 계정이 있나요? <Link to={LOGIN_PATH}>로그인</Link>
      </p>
    </section>
  );
};

export default Register;
