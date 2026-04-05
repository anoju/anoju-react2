import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { BaseLayout, Button } from '@/components';
import '@/assets/styles/pages/Home.scss';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const Home: React.FC = () => (
  <BaseLayout>
    {/* HERO Section */}
    <motion.div 
      className="home-hero" 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container">
        <motion.span variants={itemVariants} className="home-hero__subtitle">
          당신을 위한 포근한 공간
        </motion.span>
        <motion.h2 variants={itemVariants} className="home-hero__title">
          모든 것이 시작되는 곳,<br />
          <span>Anoju</span>에 오신 것을 환영합니다.
        </motion.h2>
        <motion.p variants={itemVariants} className="home-hero__desc">
          가장 편안한 마음으로 소통하고 기록하는 우리만의 공간입니다.
          지금 바로 시작해보세요.
        </motion.p>
        <motion.div variants={itemVariants} className="home-hero__actions">
          <Button size="lg">시작하기</Button>
          <Button variant="outline" size="lg">둘러보기</Button>
        </motion.div>
      </div>
    </motion.div>

    {/* Content Section */}
    <motion.div 
      className="container home-content" 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="home-content__grid">
        {[
          { title: "포근한 커뮤니티", desc: "다양한 사람들과 따뜻한 이야기를 나누고 서로를 격려하세요." },
          { title: "아름다운 갤러리", desc: "소중한 순간들을 사진으로 남기고 함께 감상하는 공간입니다." },
          { title: "나만의 기록", desc: "생각을 정리하고 일상의 조각들을 안전하게 보관하세요." }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="home-content__card"
          >
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </BaseLayout>
);

export default Home;
