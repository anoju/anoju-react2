import type { ReactionType } from '@/apis';

interface ReactionCountState {
  likeCount?: number;
  dislikeCount?: number;
}

export const getReactionKey = (targetType: 'post' | 'comment', targetId: string) => `${targetType}:${targetId}`;

export const applyReactionCount = <T extends ReactionCountState>(
  item: T,
  previous: ReactionType | null | undefined,
  next: ReactionType | null,
): T => {
  const likeCount = item.likeCount ?? 0;
  const dislikeCount = item.dislikeCount ?? 0;

  return {
    ...item,
    likeCount: likeCount + (next === 'like' ? 1 : 0) - (previous === 'like' ? 1 : 0),
    dislikeCount: dislikeCount + (next === 'dislike' ? 1 : 0) - (previous === 'dislike' ? 1 : 0),
  };
};
