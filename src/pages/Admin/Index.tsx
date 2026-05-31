import { FileSliders, ShieldAlert, UsersRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ADMIN_CONTENT_SETTINGS_PATH, ADMIN_MEMBERS_PATH, ADMIN_REPORTS_PATH } from '@/constants/app';

const Admin = () => (
  <section className="container admin-page">
    <header className="admin-page__header">
      <span className="board-page__eyebrow">Admin</span>
      <h2>관리자</h2>
      <p>콘텐츠 운영 정책, 신고, 회원 상태를 한 곳에서 관리합니다.</p>
    </header>

    <nav className="admin-hub" aria-label="관리자 하위 메뉴">
      <NavLink to={ADMIN_CONTENT_SETTINGS_PATH} className="admin-hub__item">
        <FileSliders size={22} aria-hidden="true" />
        <span>
          <strong>콘텐츠 운영 설정</strong>
          <small>게시판과 갤러리의 권한과 액션 노출을 관리합니다.</small>
        </span>
      </NavLink>
      <NavLink to={ADMIN_REPORTS_PATH} className="admin-hub__item">
        <ShieldAlert size={22} aria-hidden="true" />
        <span>
          <strong>신고 관리</strong>
          <small>신고된 게시물, 댓글, 회원을 확인하고 조치합니다.</small>
        </span>
      </NavLink>
      <NavLink to={ADMIN_MEMBERS_PATH} className="admin-hub__item">
        <UsersRound size={22} aria-hidden="true" />
        <span>
          <strong>회원 관리</strong>
          <small>회원 상태를 확인하고 정지 또는 해제합니다.</small>
        </span>
      </NavLink>
    </nav>
  </section>
);

export default Admin;
