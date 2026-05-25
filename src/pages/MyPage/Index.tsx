import { FileText, LogOut, MessageSquareText, UserRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authApi } from '@/apis';
import { Button, confirm, toast } from '@/components';
import { DEFAULT_HOME_PATH, MY_PAGE_COMMENTS_PATH, MY_PAGE_POSTS_PATH, MY_PAGE_PROFILE_PATH } from '@/constants/app';
import { useAuthStore } from '@/stores/authStore';

const MyPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const displayName = user?.nickname ?? user?.email ?? '사용자';

  const handleLogout = async () => {
    const confirmed = await confirm('로그아웃하시겠습니까?', {
      title: '로그아웃',
      confirmLabel: '로그아웃',
    });

    if (!confirmed) return;

    authApi.logout();
    toast('로그아웃되었습니다.', { tone: 'success' });
    navigate(DEFAULT_HOME_PATH, { replace: true });
  };

  return (
    <section className="container my-page my-page-hub">
      <header className="my-page__header">
        <h2>마이페이지</h2>
        <p>{displayName}님의 정보와 활동을 확인합니다.</p>
      </header>

      <nav className="hub-page__grid" aria-label="마이페이지 메뉴">
        <NavLink to={MY_PAGE_PROFILE_PATH} className="hub-card">
          <span className="hub-card__icon" aria-hidden="true">
            <UserRound size={22} />
          </span>
          <span className="hub-card__content">
            <strong>내 정보</strong>
            <span>프로필, 이메일 인증, 소셜 로그인 연결을 관리합니다.</span>
          </span>
        </NavLink>
        <NavLink to={MY_PAGE_POSTS_PATH} className="hub-card">
          <span className="hub-card__icon" aria-hidden="true">
            <FileText size={22} />
          </span>
          <span className="hub-card__content">
            <strong>내가 작성한 글</strong>
            <span>자유게시판과 Pics에 올린 글을 모아봅니다.</span>
          </span>
        </NavLink>
        <NavLink to={MY_PAGE_COMMENTS_PATH} className="hub-card">
          <span className="hub-card__icon" aria-hidden="true">
            <MessageSquareText size={22} />
          </span>
          <span className="hub-card__content">
            <strong>내가 작성한 댓글</strong>
            <span>내 댓글과 연결된 게시글로 다시 이동합니다.</span>
          </span>
        </NavLink>
      </nav>

      <div className="my-page__actions">
        <Button type="button" variant="outline" tone="neutral" onClick={handleLogout}>
          <LogOut size={16} /> 로그아웃
        </Button>
      </div>
    </section>
  );
};

export default MyPage;
