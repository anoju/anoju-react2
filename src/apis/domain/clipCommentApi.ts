import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { pb } from '@/lib/pocketBase';
import type { ClipCommentRecord } from '@/types/domain';
import { runApi } from '../apiClient';

export interface CreateClipCommentParams {
  clipId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateClipCommentParams {
  commentId: string;
  content: string;
}

export const clipCommentApi = {
  listComments: (clipId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.clipComments).getFullList<ClipCommentRecord>({
        $autoCancel: false,
        filter: `clip = "${clipId}" && status = "published" && deleted = false`,
        sort: 'created',
        expand: 'author',
      }),
    ),

  createComment: ({ clipId, content, parentCommentId }: CreateClipCommentParams) =>
    runApi(() => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(PB_COLLECTIONS.clipComments).create<ClipCommentRecord>(
        {
          clip: clipId,
          author,
          content: content.trim(),
          ...(parentCommentId ? { parentComment: parentCommentId } : {}),
          status: 'published',
          likeCount: 0,
          dislikeCount: 0,
          deleted: false,
        },
        { $autoCancel: false, expand: 'author' },
      );
    }),

  updateComment: ({ commentId, content }: UpdateClipCommentParams) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.clipComments).update<ClipCommentRecord>(
        commentId,
        { content: content.trim() },
        { $autoCancel: false, expand: 'author' },
      ),
    ),

  hideComment: (commentId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.clipComments).update<ClipCommentRecord>(
        commentId,
        {
          status: 'hidden',
          deleted: true,
          deletedAt: new Date().toISOString(),
        },
        { $autoCancel: false, expand: 'author' },
      ),
    ),

  listMyComments: () =>
    runApi(() => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(PB_COLLECTIONS.clipComments).getFullList<ClipCommentRecord>({
        $autoCancel: false,
        filter: `author = "${author}" && deleted = false`,
        expand: 'author',
      });
    }),
};
