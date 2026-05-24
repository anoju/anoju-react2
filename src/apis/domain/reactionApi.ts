import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { pb } from '@/lib/pocketBase';
import type { ReactionRecord } from '@/types/domain';
import { runApi } from '../apiClient';

export type ReactionTargetType = ReactionRecord['targetType'];
export type ReactionType = ReactionRecord['type'];

interface ReactionTarget {
  targetType: ReactionTargetType;
  targetId: string;
}

interface ToggleReactionParams extends ReactionTarget {
  type: ReactionType;
}

const getCurrentUserId = () => pb.authStore.model?.id;

const getTargetFilter = ({ targetType, targetId }: ReactionTarget, userId: string) =>
  `targetType = "${targetType}" && targetId = "${targetId}" && user = "${userId}"`;

export const reactionApi = {
  listMyReactions: (targets: ReactionTarget[]) =>
    runApi(async () => {
      const userId = getCurrentUserId();

      if (!userId || targets.length === 0) {
        return [];
      }

      const targetFilters = targets.map(
        ({ targetType, targetId }) => `(targetType = "${targetType}" && targetId = "${targetId}")`,
      );

      return pb.collection(PB_COLLECTIONS.reactions).getFullList<ReactionRecord>({
        $autoCancel: false,
        filter: `user = "${userId}" && (${targetFilters.join(' || ')})`,
      });
    }),

  toggle: ({ targetType, targetId, type }: ToggleReactionParams) =>
    runApi(async () => {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const currentReactions = await pb.collection(PB_COLLECTIONS.reactions).getFullList<ReactionRecord>({
        $autoCancel: false,
        filter: getTargetFilter({ targetType, targetId }, userId),
      });

      await Promise.all(
        currentReactions.map((reaction) =>
          pb.collection(PB_COLLECTIONS.reactions).delete(reaction.id, { $autoCancel: false }),
        ),
      );

      if (currentReactions.some((reaction) => reaction.type === type)) {
        return null;
      }

      return pb.collection(PB_COLLECTIONS.reactions).create<ReactionRecord>(
        {
          targetType,
          targetId,
          user: userId,
          type,
        },
        { $autoCancel: false },
      );
    }),
};
