import type { CommentRecord } from '@/types/domain';

interface ThreadableComment {
  id: string;
  parentComment?: string;
}

export interface CommentThreadNode<TComment extends ThreadableComment = CommentRecord> {
  comment: TComment;
  replies: Array<CommentThreadNode<TComment>>;
}

export const createCommentThreads = <TComment extends ThreadableComment>(comments: TComment[]) => {
  const nodeMap = new Map<string, CommentThreadNode<TComment>>();
  const roots: Array<CommentThreadNode<TComment>> = [];

  comments.forEach((comment) => {
    nodeMap.set(comment.id, { comment, replies: [] });
  });

  comments.forEach((comment) => {
    const node = nodeMap.get(comment.id);

    if (!node) {
      return;
    }

    const parentNode = comment.parentComment ? nodeMap.get(comment.parentComment) : undefined;

    if (parentNode) {
      parentNode.replies.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
};
