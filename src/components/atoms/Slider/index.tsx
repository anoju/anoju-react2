import type React from 'react';
import { useEffect, useId, useRef } from 'react';

export interface SliderMark {
  value: number;
  label: string;
}

export type SliderEdgePaddingPreset = 'none' | 'sm' | 'md' | 'lg';
export type SliderEdgePadding = SliderEdgePaddingPreset | number;

interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'role'> {
  disabled?: boolean;
  edgePadding?: SliderEdgePadding;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  marks?: SliderMark[];
  onValueChange: (value: number) => void;
}

const clamp = (nextValue: number, min: number, max: number) => Math.min(Math.max(nextValue, min), max);
const edgePaddingPresetMap: Record<SliderEdgePaddingPreset, number> = {
  none: 0,
  sm: 28,
  md: 44,
  lg: 56,
};

const getSteppedValue = (nextValue: number, min: number, max: number, step: number) => {
  const steppedValue = Math.round((nextValue - min) / step) * step + min;

  return clamp(steppedValue, min, max);
};

const getEdgePaddingValue = (edgePadding: SliderEdgePadding) => {
  if (typeof edgePadding === 'number') {
    return Number.isFinite(edgePadding) ? Math.max(edgePadding, 0) : 0;
  }

  return edgePaddingPresetMap[edgePadding];
};

const Slider = ({
  disabled = false,
  edgePadding = 'md',
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  marks = [],
  onValueChange,
  id,
  className = '',
  ...props
}: SliderProps) => {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const labelId = label ? `${sliderId}-label` : undefined;
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeTrackRef = useRef<HTMLSpanElement>(null);
  const edgePaddingValue = getEdgePaddingValue(edgePadding);
  const selectedMark = marks.find((mark) => mark.value === value);
  const stepCount = marks.length;
  const valueIndex = clamp(Math.round((value - min) / step), 0, Math.max(stepCount - 1, 0));
  const { ['aria-labelledby']: ariaLabelledBy, ...rootProps } = props;
  const classNames = [
    'slider',
    stepCount > 0 ? `slider--steps-${stepCount}` : '',
    stepCount > 0 ? `slider--value-${valueIndex}` : '',
    className,
  ]
    .join(' ')
    .trim();

  useEffect(() => {
    sliderRef.current?.style.setProperty('--slider-edge-offset', `${edgePaddingValue}px`);
  }, [edgePaddingValue]);

  const updateValueFromClientX = (clientX: number) => {
    const activeTrackElement = activeTrackRef.current;

    if (!activeTrackElement || disabled) {
      return;
    }

    const activeTrackRect = activeTrackElement.getBoundingClientRect();
    const nextRatio = clamp((clientX - activeTrackRect.left) / Math.max(activeTrackRect.width, 1), 0, 1);
    const nextValue = getSteppedValue(min + (max - min) * nextRatio, min, max, step);

    onValueChange(nextValue);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    updateValueFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    updateValueFromClientX(event.clientX);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const keyValueMap: Partial<Record<string, number>> = {
      ArrowDown: value - step,
      ArrowLeft: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      End: max,
      Home: min,
      PageDown: value - step * 5,
      PageUp: value + step * 5,
    };
    const nextValue = keyValueMap[event.key];

    if (nextValue === undefined) {
      return;
    }

    event.preventDefault();
    onValueChange(getSteppedValue(nextValue, min, max, step));
  };

  return (
    <div
      ref={sliderRef}
      className={classNames}
      data-disabled={disabled || undefined}
      data-orientation="horizontal"
      {...rootProps}
    >
      {label ? (
        <span className="slider__label" id={labelId}>
          {label}
        </span>
      ) : null}
      <div
        className="slider__root"
        id={sliderId}
        role="slider"
        tabIndex={disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        aria-label={rootProps['aria-label']}
        aria-labelledby={ariaLabelledBy ?? labelId}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuetext={selectedMark?.label}
        onKeyDown={handleKeyDown}
      >
        <div className="slider__track" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
          <span ref={activeTrackRef} className="slider__active-track">
            <span className="slider__range" />
            <span className="slider__thumb" />
          </span>
        </div>
      </div>
      {marks.length > 0 ? (
        <div className="slider__mark-wrap" aria-hidden="true">
          <div className="slider__marks">
            {marks.map((mark) => (
              <span className="slider__mark" key={mark.value} data-selected={mark.value === value || undefined}>
                {mark.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Slider;
