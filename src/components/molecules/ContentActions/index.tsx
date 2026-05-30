import { ReactionActions } from '../ReactionActions';
import { ShareButton } from '../ShareButton';
import type { ReactionTargetType, ReactionType } from '@/apis';

interface ContentActionsProps {
  targetType: ReactionTargetType;
  targetId: string;
  likeCount?: number;
  dislikeCount?: number;
  selectedReaction?: ReactionType | null;
  reactionDisabled?: boolean;
  shareTitle: string;
  shareText?: string;
  shareUrl: string;
  className?: string;
  onReactionToggle: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => void;
}

export const ContentActions = ({
  targetType,
  targetId,
  likeCount = 0,
  dislikeCount = 0,
  selectedReaction = null,
  reactionDisabled = false,
  shareTitle,
  shareText,
  shareUrl,
  className = 'board-detail__actions',
  onReactionToggle,
}: ContentActionsProps) => (
  <div className={className}>
    <ReactionActions
      likeCount={likeCount}
      dislikeCount={dislikeCount}
      selected={selectedReaction}
      disabled={reactionDisabled}
      onToggle={(type) => onReactionToggle(targetType, targetId, type)}
    />
    <ShareButton title={shareTitle} text={shareText} url={shareUrl} />
  </div>
);
