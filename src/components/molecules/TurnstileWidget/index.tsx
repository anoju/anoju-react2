import { useEffect, useRef, useState } from 'react';
import { getTurnstileSiteKey } from '@/config/turnstile';
import { useThemeStore } from '@/stores/themeStore';
import type { TurnstileApi } from '@/types/turnstile';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise: Promise<TurnstileApi> | null = null;

const loadTurnstileScript = () => {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.turnstile) resolve(window.turnstile);
      });
      existingScript.addEventListener('error', () => reject(new Error('Turnstile 스크립트를 불러오지 못했습니다.')));
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }

      reject(new Error('Turnstile을 초기화하지 못했습니다.'));
    });
    script.addEventListener('error', () => reject(new Error('Turnstile 스크립트를 불러오지 못했습니다.')));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

interface TurnstileWidgetProps {
  value: string;
  onChange: (token: string) => void;
  onError?: () => void;
}

export const TurnstileWidget = ({ value, onChange, onError }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [error, setError] = useState('');
  const theme = useThemeStore((state) => state.theme);
  const siteKey = getTurnstileSiteKey();
  const configurationError = siteKey ? '' : 'Turnstile Sitekey 설정이 필요합니다.';
  const visibleError = configurationError || error;

  useEffect(() => {
    let mounted = true;

    if (!siteKey || !containerRef.current) {
      return undefined;
    }

    loadTurnstileScript()
      .then((turnstile) => {
        if (!mounted || !containerRef.current || widgetIdRef.current) {
          return;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size: 'flexible',
          callback: (token) => {
            setError('');
            onChange(token);
          },
          'error-callback': () => {
            setError('보안 확인을 완료하지 못했습니다. 다시 시도해주세요.');
            onChange('');
            onError?.();
          },
          'expired-callback': () => {
            setError('보안 확인이 만료되었습니다. 다시 확인해주세요.');
            onChange('');
          },
          'timeout-callback': () => {
            setError('보안 확인 시간이 초과되었습니다. 다시 시도해주세요.');
            onChange('');
          },
        });
      })
      .catch((loadError: unknown) => {
        const message = loadError instanceof Error ? loadError.message : 'Turnstile을 불러오지 못했습니다.';
        setError(message);
        onChange('');
        onError?.();
      });

    return () => {
      mounted = false;

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onChange, onError, siteKey, theme]);

  return (
    <div className="turnstile-widget" data-verified={Boolean(value) || undefined}>
      <div ref={containerRef} className="turnstile-widget__container" />
      {visibleError ? <p className="turnstile-widget__error">{visibleError}</p> : null}
    </div>
  );
};
