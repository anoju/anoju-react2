import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { BaseLayout } from '@/components';
import '@/assets/styles/pages/Gallery.scss';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 200, damping: 20 } 
  }
};

const Gallery: React.FC = () => (
  <BaseLayout title="갤러리">
    <div className="container gallery-page">
      <header className="gallery-page__header">
        <h2>아름다운 순간</h2>
        <p>기록하고 싶은 소중한 찰나의 사진들입니다.</p>
      </header>
      
      <motion.div 
        className="gallery-page__grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="gallery-page__item"
          >
            🖼️
          </motion.div>
        ))}
      </motion.div>
    </div>
  </BaseLayout>
);

export default Gallery;
