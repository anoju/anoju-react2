import { Camera, Images, PlaySquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { CLIPS_PATH, PICS_PATH, PIC_LOG_PATH } from '@/constants/app';

const Snaps = () => (
  <section className="container hub-page">
    <header className="hub-page__header">
      <span className="hub-page__eyebrow">Snaps</span>
      <h2>오늘의 장면을 모아두는 곳</h2>
      <p>사진 중심의 피드와 앞으로 늘어날 시각 콘텐츠 메뉴를 함께 담습니다.</p>
    </header>

    <nav className="hub-page__grid" aria-label="Snaps 하위 메뉴">
      <NavLink to={PICS_PATH} className="hub-card">
        <span className="hub-card__icon" aria-hidden="true">
          <Camera size={22} />
        </span>
        <span className="hub-card__content">
          <strong>Pics</strong>
          <span>이미지와 캡션을 중심으로 보는 소셜 피드입니다.</span>
        </span>
      </NavLink>
      <NavLink to={CLIPS_PATH} className="hub-card">
        <span className="hub-card__icon" aria-hidden="true">
          <PlaySquare size={22} />
        </span>
        <span className="hub-card__content">
          <strong>Clips</strong>
          <span>30초의 짧은 순간을 영상으로 기록하고 나눕니다.</span>
        </span>
      </NavLink>
      <NavLink to={PIC_LOG_PATH} className="hub-card">
        <span className="hub-card__icon" aria-hidden="true">
          <Images size={22} />
        </span>
        <span className="hub-card__content">
          <strong>picLog</strong>
          <span>친구들과 하루를 시간별 사진 로그로 채웁니다.</span>
        </span>
      </NavLink>
    </nav>
  </section>
);

export default Snaps;
