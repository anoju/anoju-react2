import { Button } from '@/components';
import { useAuthStore } from '@/stores/authStore';

const MyPage = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <section className="container simple-page">
      <h2 className="simple-page__title">마이페이지</h2>
      <p className="simple-page__description">
        {user?.name ?? user?.email ?? '사용자'}님의 정보를 확인하는 화면입니다.
      </p>
      <div className="simple-page__actions">
        <Button type="button" variant="outline" tone="neutral" onClick={logout}>
          로그아웃
        </Button>
      </div>
    </section>
  );
};

export default MyPage;
