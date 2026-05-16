import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components';
import { DEFAULT_HOME_PATH } from '@/constants/app';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') ?? DEFAULT_HOME_PATH;
  }, [location.search]);

  return (
    <section className="container simple-page">
      <h2 className="simple-page__title">로그인</h2>
      <p className="simple-page__description">
        마이페이지처럼 로그인이 필요한 화면은 로그인 후 계속 이용할 수 있습니다.
      </p>
      <div className="simple-page__actions">
        <Button type="button" onClick={() => navigate(redirectPath, { replace: true })}>
          임시 로그인 흐름 확인
        </Button>
      </div>
    </section>
  );
};

export default Login;
