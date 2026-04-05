import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import BaseLayout from './components/templates/BaseLayout';
import Button from './components/atoms/Button';

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

const Home = () => (
  <BaseLayout>
    {/* HERO Section */}
    <motion.div 
      className="home-hero" 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ 
        padding: '6rem 1.5rem', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)',
      }}
    >
      <div className="container">
        <motion.span 
          variants={itemVariants}
          style={{ 
            color: 'var(--color-primary)', 
            fontWeight: 700, 
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'block',
            marginBottom: '1rem'
          }}>
          당신을 위한 포근한 공간
        </motion.span>
        <motion.h2 
          variants={itemVariants}
          style={{ 
            fontSize: '2.8rem', 
            marginBottom: '1.5rem', 
            lineHeight: 1.15,
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '-0.03em'
          }}>
          모든 것이 시작되는 곳,<br />
          <span style={{ color: 'var(--color-primary)' }}>Anoju</span>에 오신 것을 환영합니다.
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          style={{ 
            fontSize: '1.2rem', 
            color: 'var(--color-text-dimmed)', 
            maxWidth: '520px', 
            margin: '0 auto 2.5rem' 
          }}>
          가장 편안한 마음으로 소통하고 기록하는 우리만의 공간입니다.
          지금 바로 시작해보세요.
        </motion.p>
        <motion.div 
          variants={itemVariants}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button size="lg">시작하기</Button>
          <Button variant="outline" size="lg">둘러보기</Button>
        </motion.div>
      </div>
    </motion.div>

    {/* Content Section */}
    <motion.div 
      className="container" 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      style={{ padding: '4rem 1.5rem' }}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem' 
      }}>
        {[
          { title: "포근한 커뮤니티", desc: "다양한 사람들과 따뜻한 이야기를 나누고 서로를 격려하세요." },
          { title: "아름다운 갤러리", desc: "소중한 순간들을 사진으로 남기고 함께 감상하는 공간입니다." },
          { title: "나만의 기록", desc: "생각을 정리하고 일상의 조각들을 안전하게 보관하세요." }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            style={{ 
              padding: '2.5rem', 
              backgroundColor: 'var(--color-surface)', 
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)'
            }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>{item.title}</h3>
            <p style={{ color: 'var(--color-text-dimmed)' }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </BaseLayout>
);

const NotFound = () => (
  <BaseLayout title="404 Not Found">
    <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>
        페이지를 찾을 수 없습니다.
      </h2>
      <Button variant="outline" onClick={() => window.location.href = '/'}>
        홈으로 돌아가기
      </Button>
    </div>
  </BaseLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
