import { useEffect, useRef } from 'react';

interface StarParticle {
  angle: number;
  color: string;
  layer: number;
  phase: number;
  radius: number;
  size: number;
  speed: number;
  wobble: number;
}

interface StarBurstBackgroundProps {
  className?: string;
}

const STAR_COLORS = ['#f3e8ff', '#d9c5ff', '#c19cff', '#a674f2', '#ffffff'];
const STAR_COUNT = 96;

const createParticles = () =>
  Array.from({ length: STAR_COUNT }, (_, index): StarParticle => {
    const layer = index % 3;

    return {
      angle: (Math.PI * 2 * index) / STAR_COUNT + Math.random() * 0.18,
      color: STAR_COLORS[index % STAR_COLORS.length],
      layer,
      phase: Math.random(),
      radius: 0.18 + Math.random() * 0.72,
      size: 0.8 + Math.random() * (layer === 0 ? 1.4 : 2.4),
      speed: 0.035 + Math.random() * 0.05,
      wobble: 0.6 + Math.random() * 1.8,
    };
  });

const resizeCanvas = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width * pixelRatio));
  const height = Math.max(1, Math.floor(rect.height * pixelRatio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  return {
    height: rect.height,
    width: rect.width,
  };
};

export const StarBurstBackground = ({ className }: StarBurstBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<StarParticle[]>(createParticles());

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return undefined;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrameId = 0;
    let reducedMotion = motionQuery.matches;

    const draw = (time: number) => {
      const { width, height } = resizeCanvas(canvas, context);
      const minSize = Math.min(width, height);
      const centerX = width * 0.5;
      const centerY = height * 0.38;
      const animationTime = reducedMotion ? 1800 : time;

      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, minSize * 0.72);
      glow.addColorStop(0, 'rgba(193, 156, 255, 0.28)');
      glow.addColorStop(0.42, 'rgba(143, 85, 232, 0.13)');
      glow.addColorStop(1, 'rgba(17, 16, 25, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => {
        const loopProgress = (particle.phase + animationTime * 0.00006 * particle.speed * 24) % 1;
        const distance = minSize * particle.radius * (0.22 + loopProgress * 0.95);
        const fade = Math.max(0, 1 - loopProgress);
        const sideWave = Math.sin(animationTime * 0.0012 * particle.wobble + particle.phase * Math.PI * 2);
        const spread = sideWave * (particle.layer + 1) * 3;
        const x = centerX + Math.cos(particle.angle) * distance + Math.cos(particle.angle + Math.PI / 2) * spread;
        const y = centerY + Math.sin(particle.angle) * distance + Math.sin(particle.angle + Math.PI / 2) * spread;
        const alpha = (0.16 + particle.layer * 0.1) * fade;

        context.beginPath();
        context.strokeStyle = `rgba(193, 156, 255, ${alpha})`;
        context.lineWidth = 0.6 + particle.layer * 0.35;
        context.moveTo(centerX, centerY);
        context.lineTo(x, y);
        context.stroke();

        context.beginPath();
        context.fillStyle = particle.color;
        context.globalAlpha = 0.24 + fade * 0.72;
        context.arc(x, y, particle.size * (0.7 + fade), 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      });

      if (!reducedMotion) {
        animationFrameId = window.requestAnimationFrame(draw);
      }
    };

    const handleResize = () => {
      resizeCanvas(canvas, context);
      draw(1800);
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      window.cancelAnimationFrame(animationFrameId);
      draw(1800);

      if (!reducedMotion) {
        animationFrameId = window.requestAnimationFrame(draw);
      }
    };

    resizeCanvas(canvas, context);
    draw(0);

    if (!reducedMotion) {
      animationFrameId = window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', handleResize);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const classNames = ['star-burst-bg', className].filter(Boolean).join(' ');

  return (
    <div className={classNames} aria-hidden="true">
      <canvas ref={canvasRef} className="star-burst-bg__canvas" />
      <div className="star-burst-bg__halo" />
    </div>
  );
};
