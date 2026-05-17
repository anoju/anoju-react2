import { MessageCircle, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { FREE_BOARD_PATH } from '@/constants/app';

const Playground = () => (
  <section className="container hub-page">
    <header className="hub-page__header">
      <span className="hub-page__eyebrow">playground</span>
      <h2>가볍게 꺼내놓는 이야기들</h2>
      <p>자유롭게 묻고, 남기고, 이어가는 커뮤니티 공간입니다.</p>
    </header>

    <nav className="hub-page__grid" aria-label="playground 하위 메뉴">
      <NavLink to={FREE_BOARD_PATH} className="hub-card">
        <span className="hub-card__icon" aria-hidden="true">
          <MessageCircle size={22} />
        </span>
        <span className="hub-card__content">
          <strong>자유게시판</strong>
          <span>일상, 질문, 잡담을 모바일 리스트로 빠르게 둘러봅니다.</span>
        </span>
      </NavLink>
      <article className="hub-card hub-card--muted">
        <span className="hub-card__icon" aria-hidden="true">
          <Sparkles size={22} />
        </span>
        <span className="hub-card__content">
          <strong>다음 놀거리</strong>
          <span>새 게시판이 생기면 이곳에 이어서 추가됩니다.</span>
        </span>
      </article>
    </nav>
  </section>
);

export default Playground;
