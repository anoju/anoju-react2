import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ReactionType } from '@/apis';

interface ReactionActionsProps {
  likeCount: number;
  dislikeCount?: number;
  selected?: ReactionType | null;
  disabled?: boolean;
  compact?: boolean;
  onToggle: (type: ReactionType) => void;
}

export const ReactionActions = ({
  likeCount,
  dislikeCount = 0,
  selected,
  disabled = false,
  compact = false,
  onToggle,
}: ReactionActionsProps) => {
  const isLikeSelected = selected === 'like';
  const isDislikeSelected = selected === 'dislike';

  return (
    <div className="reaction-actions" data-compact={compact || undefined} aria-label="반응">
      <button
        type="button"
        data-selected={isLikeSelected || undefined}
        disabled={disabled}
        onClick={() => onToggle('like')}
        aria-pressed={isLikeSelected}
        aria-label={`좋아요 ${likeCount}`}
      >
        <ThumbsUp
          size={16}
          fill={isLikeSelected ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        <span>{compact ? likeCount : `좋아요 ${likeCount}`}</span>
      </button>
      <button
        type="button"
        data-selected={isDislikeSelected || undefined}
        disabled={disabled}
        onClick={() => onToggle('dislike')}
        aria-pressed={isDislikeSelected}
        aria-label={`싫어요 ${dislikeCount}`}
      >
        <ThumbsDown
          size={16}
          fill={isDislikeSelected ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        <span>{compact ? dislikeCount : `싫어요 ${dislikeCount}`}</span>
      </button>
    </div>
  );
};
