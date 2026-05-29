import { FileText, MonitorSmartphone, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { DEVICE_INFO_PATH, FREE_BOARD_PATH, IT_LOGS_PATH } from '@/constants/app';

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
      <NavLink to={IT_LOGS_PATH} className="hub-card">
        <span className="hub-card__icon" aria-hidden="true">
          <FileText size={22} />
        </span>
        <span className="hub-card__content">
          <strong>ITLogs</strong>
          <span>관리자가 IT 기록과 안내를 정리합니다.</span>
        </span>
      </NavLink>
      <NavLink to={DEVICE_INFO_PATH} className="hub-card">
        <span className="hub-card__icon" aria-hidden="true">
          <MonitorSmartphone size={22} />
        </span>
        <span className="hub-card__content">
          <strong>디바이스정보</strong>
          <span>모바일 기기별 웹 해상도와 표시 설정을 확인합니다.</span>
        </span>
      </NavLink>
    </nav>
  </section>
);

export default Playground;
