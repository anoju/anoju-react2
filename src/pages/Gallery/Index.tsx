import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const Gallery = () => (
  <section className="container gallery-page">
    <header className="gallery-page__header">
      <h2>아름다운 순간</h2>
      <p>기록하고 싶은 소중한 찰나의 사진들입니다.</p>
    </header>

    <motion.div className="gallery-page__grid" variants={containerVariants} initial="hidden" animate="visible">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div key={index} variants={itemVariants} className="gallery-page__item">
          <span aria-hidden="true">이미지</span>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default Gallery;
