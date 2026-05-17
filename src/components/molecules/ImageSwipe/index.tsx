import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';
import { Img } from '@/components/atoms';

export interface ImageSwipeItem {
  id: string;
  src: string;
  alt: string;
  href?: string;
}

interface ImageSwipeProps {
  items: ImageSwipeItem[];
  label: string;
  emptyLabel?: string;
  className?: string;
}

export const ImageSwipe = ({ items, label, emptyLabel = '이미지 없음', className }: ImageSwipeProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: false, loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rootClassName = `image-swipe${className ? ` ${className}` : ''}`;

  const handleSelect = useCallback(() => {
    setSelectedIndex(emblaApi?.selectedScrollSnap() ?? 0);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return undefined;
    }

    emblaApi.on('select', handleSelect);
    emblaApi.on('reInit', handleSelect);

    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('reInit', handleSelect);
    };
  }, [emblaApi, handleSelect, items.length]);

  const handleDotClick = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  if (items.length === 0) {
    return (
      <div className={rootClassName} aria-label={label}>
        <div className="image-swipe__empty">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div className={rootClassName} aria-label={label}>
      <div className="image-swipe__viewport" ref={emblaRef}>
        <div className="image-swipe__track">
          {items.map((item, index) => {
            const slideContent = (
              <>
                <Img src={item.src} alt={item.alt} />
                {items.length > 1 ? (
                  <span className="image-swipe__count">
                    {index + 1}/{items.length}
                  </span>
                ) : null}
              </>
            );

            return (
              <div key={item.id} className="image-swipe__slide">
                {item.href ? (
                  <Link to={item.href} className="image-swipe__link">
                    {slideContent}
                  </Link>
                ) : (
                  <div className="image-swipe__figure">{slideContent}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {items.length > 1 ? (
        <div className="image-swipe__dots" aria-label="이미지 위치">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${index + 1}번째 이미지로 이동`}
              aria-current={selectedIndex === index}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
