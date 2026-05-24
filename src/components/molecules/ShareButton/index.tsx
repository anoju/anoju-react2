import { Share2 } from 'lucide-react';
import { shareContent } from '@/utils/share';

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

export const ShareButton = ({ title, text, url, label = '공유', iconOnly = false, className }: ShareButtonProps) => {
  const handleClick = () => {
    void shareContent({ title, text, url });
  };

  return (
    <button
      type="button"
      className={['share-button', className].filter(Boolean).join(' ')}
      data-icon-only={iconOnly || undefined}
      onClick={handleClick}
      aria-label={`${title} 공유하기`}
    >
      <Share2 size={16} aria-hidden="true" />
      {iconOnly ? null : <span>{label}</span>}
    </button>
  );
};
