import type { CommentRecord } from '@/types/domain';

export interface CommentThreadNode {
  comment: CommentRecord;
  replies: CommentThreadNode[];
}

export const createCommentThreads = (comments: CommentRecord[]) => {
  const nodeMap = new Map<string, CommentThreadNode>();
  const roots: CommentThreadNode[] = [];

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
