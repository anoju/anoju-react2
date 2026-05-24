import type React from 'react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Checkbox, Input, SocialLoginButtons, confirm, toast } from '@/components'
import { authApi, getUserMessage } from '@/apis'
import { DEFAULT_HOME_PATH, REGISTER_PATH } from '@/constants/app'
import { useOAuthProviders } from '@/hooks/useOAuthProviders'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { providers, loading: providersLoading } = useOAuthProviders()

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('redirect') ?? DEFAULT_HOME_PATH
  }, [location.search])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (!identity.trim() || !password) {
      toast('이메일과 비밀번호를 입력해주세요.', { tone: 'warning' })
      return
    }

    setSubmitting(true)

    try {
      await authApi.login({ identity: identity.trim(), password, autoLogin })
      toast('로그인되었습니다.', { tone: 'success' })
      navigate(redirectPath, { replace: true })
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!identity.trim()) {
      toast('비밀번호 재설정을 받을 이메일을 입력해주세요.', { tone: 'warning' })
      return
    }

    const confirmed = await confirm(`${identity.trim()} 주소로 비밀번호 재설정 메일을 보낼까요?`, {
      title: '비밀번호 재설정',
      confirmLabel: '발송',
    })

    if (!confirmed) {
      return
    }

    try {
      await authApi.requestPasswordReset(identity.trim())
      toast('비밀번호 재설정 메일을 발송했습니다.', { tone: 'success' })
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' })
    }
  }

  return (
    <section className="container auth-page">
      <header className="auth-page__header">
        <h2>로그인</h2>
        <p>소셜 로그인으로 간편하게 로그인하세요</p>
      </header>

      <form className="auth-page__form" onSubmit={handleSubmit}>
        <Input
          label="이메일"
          type="email"
          value={identity}
          onChange={(event) => setIdentity(event.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        <Checkbox
          label="자동 로그인"
          description="개인 기기에서만 사용하세요."
          checked={autoLogin}
          onChange={(event) => setAutoLogin(event.target.checked)}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          로그인
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
            context="login"
            autoLogin={autoLogin}
            onSuccess={() => navigate(redirectPath, { replace: true })}
          />
        </>
      ) : null}

      <div className="auth-page__actions">
        <Button type="button" variant="plain" tone="neutral" onClick={handlePasswordReset}>
          비밀번호 재설정
        </Button>
      </div>

      <p className="auth-page__link">
        아직 계정이 없나요? <Link to={REGISTER_PATH}>회원가입</Link>
      </p>
    </section>
  )
}

export default Login
