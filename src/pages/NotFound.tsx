import React from 'react';
import { BaseLayout, Button } from '@/components';
import { useNavigate } from 'react-router-dom';
import '@/assets/styles/pages/NotFound.scss';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <BaseLayout title="404 Not Found">
      <div className="container not-found">
        <span className="not-found__icon">🛸</span>
        <h2 className="not-found__title">페이지를 찾을 수 없습니다.</h2>
        <p className="not-found__desc">
          요청하신 주소가 잘못되었거나 삭제되었습니다.
        </p>
        <Button variant="outline" size="lg" onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </div>
    </BaseLayout>
  );
};

export default NotFound;
