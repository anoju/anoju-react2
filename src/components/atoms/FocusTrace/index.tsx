import { useEffect, useRef, useState } from 'react';

interface FocusTraceProps {
  strokeWidth?: number;
}

interface TraceSize {
  width: number;
  height: number;
  radius: number;
}

const getRadius = (element: HTMLElement) => {
  const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius);

  return Number.isFinite(radius) ? radius : 0;
};

const getTracePath = ({ width, height, radius }: TraceSize, strokeWidth: number) => {
  const inset = strokeWidth / 2;
  const right = Math.max(inset, width - inset);
  const bottom = Math.max(inset, height - inset);
  const maxRadius = Math.max(0, Math.min(radius, (right - inset) / 2, (bottom - inset) / 2));

  if (width <= strokeWidth || height <= strokeWidth) {
    return '';
  }

  if (!maxRadius) {
    return [
      `M ${inset} ${inset}`,
      `H ${right}`,
      `V ${bottom}`,
      `H ${inset}`,
      `V ${inset}`,
    ].join(' ');
  }

  const cornerMidOffset = maxRadius - maxRadius / Math.SQRT2;
  const startX = inset + cornerMidOffset;
  const startY = inset + cornerMidOffset;
  const topLeftArcStartX = inset + maxRadius;
  const topLeftArcEndY = inset + maxRadius;

  return [
    `M ${startX} ${startY}`,
    `A ${maxRadius} ${maxRadius} 0 0 1 ${topLeftArcStartX} ${inset}`,
    `H ${right - maxRadius}`,
    `A ${maxRadius} ${maxRadius} 0 0 1 ${right} ${inset + maxRadius}`,
    `V ${bottom - maxRadius}`,
    `A ${maxRadius} ${maxRadius} 0 0 1 ${right - maxRadius} ${bottom}`,
    `H ${inset + maxRadius}`,
    `A ${maxRadius} ${maxRadius} 0 0 1 ${inset} ${bottom - maxRadius}`,
    `V ${topLeftArcEndY}`,
    `A ${maxRadius} ${maxRadius} 0 0 1 ${startX} ${startY}`,
  ].join(' ');
};

const FocusTrace = ({ strokeWidth = 2.5 }: FocusTraceProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<TraceSize>({ width: 0, height: 0, radius: 0 });

  useEffect(() => {
    const host = ref.current?.parentElement;

    if (!host) return undefined;

    const updateSize = () => {
      const rect = host.getBoundingClientRect();

      setSize({
        width: rect.width,
        height: rect.height,
        radius: getRadius(host),
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(host);

    return () => resizeObserver.disconnect();
  }, []);

  const path = getTracePath(size, strokeWidth);

  return (
    <span className="focus-trace" ref={ref} aria-hidden="true">
      <svg className="focus-trace__svg" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
        {path ? <path className="focus-trace__path" d={path} pathLength={1} strokeWidth={strokeWidth} /> : null}
      </svg>
    </span>
  );
};

export default FocusTrace;
