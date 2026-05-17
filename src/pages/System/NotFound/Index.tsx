import { useNavigate } from 'react-router-dom';
import { Button } from '@/components';
import { DEFAULT_HOME_PATH } from '@/constants/app';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="container not-found">
      <h2 className="not-found__title">페이지를 찾을 수 없습니다.</h2>
      <p className="not-found__desc">요청하신 주소가 잘못되었거나 삭제되었습니다.</p>
      <Button variant="outline" size="lg" onClick={() => navigate(DEFAULT_HOME_PATH)}>
        홈으로 돌아가기
      </Button>
    </section>
  );
};

export default NotFound;
