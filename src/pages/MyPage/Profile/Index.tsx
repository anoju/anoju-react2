import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { Avatar, Button, Dialog, Input, Slider, SocialLoginButtons, confirm, toast } from '@/components';
import { authApi, getUserMessage } from '@/apis';
import type { LinkedOAuthProvider, SupportedOAuthProvider } from '@/apis/authApi';
import { useOAuthProviders } from '@/hooks/useOAuthProviders';
import { useAuthStore } from '@/stores/authStore';
import { isNicknameConflictMessage, normalizeNickname, validateNickname } from '@/utils/nickname';
import { UPLOAD_LIMITS, validateImageFile } from '@/utils/uploadPolicy';

const CROP_SIZE = 512;

const MyPageProfile = () => {
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(user?.avatarUrl);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<HTMLImageElement | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [actualEmail, setActualEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState<LinkedOAuthProvider[]>([]);
  const [linkedLoading, setLinkedLoading] = useState(true);
  const { providers, loading: providersLoading } = useOAuthProviders();

  const linkedProviderNames = useMemo(() => linkedProviders.map((provider) => provider.provider), [linkedProviders]);

  const loginMethodCount = useMemo(() => {
    const hasEmailLogin = Boolean(user?.email && !user.isVirtualEmail);
    return (hasEmailLogin ? 1 : 0) + linkedProviders.length;
  }, [linkedProviders.length, user?.email, user?.isVirtualEmail]);

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

  useEffect(() => {
    setNickname(user?.nickname ?? '');
    setAvatarPreviewUrl(user?.avatarUrl);
  }, [user?.avatarUrl, user?.nickname]);

  useEffect(
    () => () => {
      if (avatarPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      if (cropSourceUrl) {
        URL.revokeObjectURL(cropSourceUrl);
      }
    },
    [avatarPreviewUrl, cropSourceUrl],
  );

  useEffect(() => {
    if (!cropSourceUrl) {
      setCropImage(null);
      return undefined;
    }

    const image = new Image();
    image.onload = () => setCropImage(image);
    image.src = cropSourceUrl;

    return () => {
      image.onload = null;
    };
  }, [cropSourceUrl]);

  useEffect(() => {
    const canvas = cropCanvasRef.current;

    if (!canvas || !cropImage) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    context.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    const baseScale = Math.max(CROP_SIZE / cropImage.width, CROP_SIZE / cropImage.height);
    const scale = baseScale * cropZoom;
    const drawWidth = cropImage.width * scale;
    const drawHeight = cropImage.height * scale;
    const panX = (cropOffsetX / 100) * Math.max((drawWidth - CROP_SIZE) / 2, 0);
    const panY = (cropOffsetY / 100) * Math.max((drawHeight - CROP_SIZE) / 2, 0);
    const drawX = (CROP_SIZE - drawWidth) / 2 + panX;
    const drawY = (CROP_SIZE - drawHeight) / 2 + panY;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
    context.drawImage(cropImage, drawX, drawY, drawWidth, drawHeight);
  }, [cropImage, cropOffsetX, cropOffsetY, cropZoom]);

  const closeCropDialog = () => {
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
    }

    setCropSourceUrl(null);
    setCropImage(null);
    setCropZoom(1);
    setCropOffsetX(0);
    setCropOffsetY(0);
  };

  const handleAvatarSelect: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const error = validateImageFile(file, UPLOAD_LIMITS.profileImage);

    if (error) {
      toast(error, { tone: 'danger' });
      return;
    }

    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
    }

    setCropSourceUrl(URL.createObjectURL(file));
  };

  const handleCropConfirm = async () => {
    const canvas = cropCanvasRef.current;

    if (!canvas) {
      toast('이미지를 다시 선택해주세요.', { tone: 'warning' });
      return;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', 0.92);
    });

    if (!blob) {
      toast('프로필 이미지를 만들 수 없습니다.', { tone: 'danger' });
      return;
    }

    const nextFile = new File([blob], `profile-${user?.id ?? 'user'}.webp`, { type: 'image/webp' });
    const nextPreviewUrl = URL.createObjectURL(nextFile);

    if (avatarPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarFile(nextFile);
    setAvatarPreviewUrl(nextPreviewUrl);
    closeCropDialog();
  };

  const handleAvatarRemove = async () => {
    if (!user?.avatar && !avatarFile) {
      setAvatarPreviewUrl(undefined);
      return;
    }

    const confirmed = await confirm('프로필 이미지를 삭제하시겠습니까?', {
      title: '프로필 이미지 삭제',
      confirmLabel: '삭제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    if (avatarFile) {
      if (avatarPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      setAvatarFile(null);
      setAvatarPreviewUrl(user?.avatarUrl);
      return;
    }

    setAvatarRemoving(true);

    try {
      await authApi.updateProfile({ removeAvatar: true });
      setAvatarPreviewUrl(undefined);
      toast('프로필 이미지를 삭제했습니다.', { tone: 'success' });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setAvatarRemoving(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const nextNicknameError = validateNickname(nickname);

    if (nextNicknameError) {
      setNicknameError(nextNicknameError);
      toast(nextNicknameError, { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const normalizedNickname = normalizeNickname(nickname);
      const nicknameAvailable = await authApi
        .isNicknameAvailable(normalizedNickname, user?.id)
        .catch(() => true);

      if (!nicknameAvailable) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        toast('이미 사용 중인 닉네임입니다.', { tone: 'warning' });
        return;
      }

      await authApi.updateProfile({
        nickname: normalizedNickname,
        avatarFile: avatarFile ?? undefined,
      });
      setAvatarFile(null);
      toast('내 정보가 저장되었습니다.', { tone: 'success' });
    } catch (error) {
      const message = getUserMessage(error);

      if (isNicknameConflictMessage(message)) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        toast('이미 사용 중인 닉네임입니다.', { tone: 'warning' });
        return;
      }

      toast(message, { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerificationRequest = async () => {
    if (!user?.email || user.isVirtualEmail) {
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

  const handleActualEmailSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const nextEmail = actualEmail.trim();

    if (!nextEmail) {
      toast('실제 이메일을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setEmailSubmitting(true);

    try {
      await authApi.requestEmailChange({ email: nextEmail });
      toast('이메일 변경 인증 메일을 발송했습니다.', { tone: 'success' });
      setActualEmail('');
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setEmailSubmitting(false);
    }
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

    if (!confirmed) return;

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
        <h2>내 정보</h2>
        <p>{user?.nickname ?? user?.email ?? '사용자'}님의 정보를 확인하고 수정합니다.</p>
      </header>

      <dl className="my-page__summary">
        <div>
          <dt>이메일</dt>
          <dd>
            {user?.email ?? '-'}
            {user?.isVirtualEmail ? <span className="my-page__badge">실제 이메일 등록 필요</span> : null}
          </dd>
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

      {user?.isVirtualEmail ? (
        <section className="my-page__notice" aria-labelledby="actual-email-title">
          <h3 id="actual-email-title">실제 이메일 등록</h3>
          <p>게시글 작성과 주요 기능을 사용하려면 실제 이메일을 등록하고 인증을 완료해주세요.</p>
          <form className="my-page__form" onSubmit={handleActualEmailSubmit}>
            <Input
              label="실제 이메일"
              type="email"
              value={actualEmail}
              onChange={(event) => setActualEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Button type="submit" loading={emailSubmitting}>
              이메일 인증 요청
            </Button>
          </form>
        </section>
      ) : null}

      <form className="my-page__form" onSubmit={handleSubmit}>
        <section className="profile-image-field" aria-labelledby="profile-image-title">
          <div className="profile-image-field__preview">
            <Avatar src={avatarPreviewUrl} name={nickname || user?.email} size="xl" />
          </div>
          <div className="profile-image-field__content">
            <h3 id="profile-image-title">프로필 이미지</h3>
            <p>jpg, png, webp 이미지를 2MB 이하로 선택하고 정사각형으로 자른 뒤 저장합니다.</p>
            <input
              ref={fileInputRef}
              className="profile-image-field__input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelect}
            />
            <div className="profile-image-field__actions">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} /> 이미지 선택
              </Button>
              {avatarPreviewUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  tone="danger"
                  loading={avatarRemoving}
                  onClick={handleAvatarRemove}
                >
                  <Trash2 size={16} /> 이미지 삭제
                </Button>
              ) : null}
            </div>
          </div>
        </section>
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

      <Dialog
        open={Boolean(cropSourceUrl)}
        title="프로필 이미지 자르기"
        description="미리보기 영역에 맞춰 정사각형 프로필 이미지를 만듭니다."
        closeOnOverlayClick={false}
        onClose={closeCropDialog}
        footer={
          <>
            <Button type="button" variant="outline" tone="neutral" fullWidth onClick={closeCropDialog}>
              취소
            </Button>
            <Button type="button" fullWidth onClick={handleCropConfirm}>
              적용
            </Button>
          </>
        }
      >
        <div className="profile-crop">
          <canvas ref={cropCanvasRef} className="profile-crop__canvas" aria-label="정사각형 프로필 이미지 미리보기" />
          <div className="profile-crop__controls">
            <Slider label="확대" min={1} max={3} step={0.05} value={cropZoom} onValueChange={setCropZoom} />
            <Slider label="가로 위치" min={-100} max={100} step={1} value={cropOffsetX} onValueChange={setCropOffsetX} />
            <Slider label="세로 위치" min={-100} max={100} step={1} value={cropOffsetY} onValueChange={setCropOffsetY} />
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default MyPageProfile;
