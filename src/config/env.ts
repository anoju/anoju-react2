interface AppEnv {
  appUrl: string;
  pocketBaseUrl: string;
  hasPocketBaseUrl: boolean;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getRequiredProductionEnv = (key: string, fallback: string) => {
  const value = import.meta.env[key];

  if (typeof value === 'string' && value.trim()) {
    return trimTrailingSlash(value.trim());
  }

  if (import.meta.env.PROD) {
    throw new Error(`${key} 환경 변수가 설정되지 않았습니다.`);
  }

  return fallback;
};

const pocketBaseEnvValue = import.meta.env.VITE_PB_URL;

export const appEnv: AppEnv = {
  appUrl: getRequiredProductionEnv('VITE_APP_URL', 'http://localhost:5173'),
  pocketBaseUrl: getRequiredProductionEnv('VITE_PB_URL', 'http://127.0.0.1:8090'),
  hasPocketBaseUrl: typeof pocketBaseEnvValue === 'string' && pocketBaseEnvValue.trim().length > 0,
};
