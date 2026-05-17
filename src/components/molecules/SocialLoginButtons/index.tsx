import { Button, toast } from '@/components';
import { authApi, getUserMessage } from '@/apis';
import type { OAuthProviderOption, SupportedOAuthProvider } from '@/apis/authApi';

interface SocialLoginButtonsProps {
  providers: OAuthProviderOption[];
  loading?: boolean;
  context: 'login' | 'register' | 'link';
  disabledProviders?: SupportedOAuthProvider[];
  autoLogin?: boolean;
  onSuccess?: () => void;
}

const providerLabels: Record<SupportedOAuthProvider, string> = {
  google: 'Google',
  naver: 'Naver',
  kakao: 'Kakao',
};

const getActionText = (context: SocialLoginButtonsProps['context']) => {
  if (context === 'link') return '연결';
  if (context === 'register') return '시작하기';
  return '계속하기';
};

export const SocialLoginButtons = ({
  providers,
  loading = false,
  context,
  disabledProviders = [],
  autoLogin = false,
  onSuccess,
}: SocialLoginButtonsProps) => {
  const handleOAuth = async (provider: SupportedOAuthProvider) => {
    try {
      await authApi.loginWithOAuth(provider, context === 'link' ? undefined : autoLogin);
      toast(
        context === 'link'
          ? `${providerLabels[provider]} 계정을 연결했습니다.`
          : `${providerLabels[provider]} 계정으로 로그인되었습니다.`,
        { tone: 'success' },
      );
      onSuccess?.();
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    }
  };

  if (loading) {
    return (
      <div className="social-login" aria-label="소셜 로그인">
        <Button type="button" variant="outline" tone="neutral" fullWidth loading>
          소셜 로그인 확인 중
        </Button>
      </div>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="social-login" aria-label="소셜 로그인">
      {providers.map((provider) => {
        const disabled = disabledProviders.includes(provider.name);

        return (
          <Button
            key={provider.name}
            type="button"
            variant="outline"
            tone="neutral"
            fullWidth
            disabled={disabled}
            onClick={() => handleOAuth(provider.name)}
          >
            {providerLabels[provider.name]}로 {getActionText(context)}
          </Button>
        );
      })}
    </div>
  );
};
