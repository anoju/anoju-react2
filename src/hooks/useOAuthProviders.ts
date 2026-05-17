import { useCallback, useEffect, useState } from 'react';
import { authApi, type OAuthProviderOption } from '@/apis/authApi';

export const useOAuthProviders = () => {
  const [providers, setProviders] = useState<OAuthProviderOption[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProviders = useCallback(async () => {
    setLoading(true);

    try {
      setProviders(await authApi.getOAuthProviders());
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  return {
    providers,
    loading,
    reload: loadProviders,
  };
};
