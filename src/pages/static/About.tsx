import React from 'react';
import { motion } from 'framer-motion';
import { BaseLayout } from '@/components';
import '@/assets/styles/pages/About.scss';

const About: React.FC = () => (
  <BaseLayout title="프로젝트 소개">
    <div className="container about-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="about-page__title">
          About <span>Anoju</span>
        </h2>
        
        <p className="about-page__main-desc">
          'Anoju'는 '안아주다'라는 중의적인 의미를 담아 탄생했습니다.<br />
          바쁜 일상 속에서 서로를 따뜻하게 맞이하고, 소소한 행복을 기록하며,<br />
          같은 관심사를 가진 친구들과 소통할 수 있는 안전한 디지털 피난처를 지향합니다.
        </p>

        <div className="about-page__value-box">
          <h3>우리의 가치</h3>
          <ul className="about-page__value-list">
            <li className="about-page__value-item">
              <span className="icon">🫂</span>
              <div className="content">
                <strong>포용 (Embrace)</strong>
                <p>모든 사용자가 있는 그대로 존중받을 수 있는 따뜻한 환경을 조성합니다.</p>
              </div>
            </li>
            <li className="about-page__value-item">
              <span className="icon">🌿</span>
              <div className="content">
                <strong>온기 (Warmth)</strong>
                <p>차가운 디지털 세상에서 인간적인 온도가 느껴지는 경험을 제공합니다.</p>
              </div>
            </li>
            <li className="about-page__value-item">
              <span className="icon">✨</span>
              <div className="content">
                <strong>단순함 (Simplicity)</strong>
                <p>핵심 기능에 집중하며 군더더기 없는 미니멀한 사용성을 추구합니다.</p>
              </div>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  </BaseLayout>
);

export default About;
