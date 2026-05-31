import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { pb } from '@/lib/pocketBase';
import type { CommentRecord, ListParams, PostImageRecord, PostRecord, PostType } from '@/types/domain';
import { runApi } from '../apiClient';

const getPublishedFilter = (type: PostType, extraFilter?: string) =>
  [`type = "${type}"`, 'status = "published"', 'deleted = false', extraFilter ? `(${extraFilter})` : '']
    .filter(Boolean)
    .join(' && ');

export interface PostListParams extends ListParams {
  type: PostType;
  authorId?: string;
}

export interface CreatePostParams {
  title: string;
  content: string;
  type: PostType;
  imageFiles?: Array<{
    id: string;
    file: File;
    url?: string;
    alt: string;
    sortOrder: number;
    isCover: boolean;
  }>;
}

export interface UpdatePostParams {
  postId: string;
  title: string;
  content: string;
}

export interface CreateCommentParams {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentParams {
  commentId: string;
  content: string;
}

export const communityApi = {
  listPosts: ({ type, page = 1, perPage = 20, filter, authorId, expand = 'author' }: PostListParams) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.posts).getList<PostRecord>(page, perPage, {
        $autoCancel: false,
        filter: getPublishedFilter(
          type,
          [filter, authorId ? `author = "${authorId}"` : ''].filter(Boolean).join(' && '),
        ),
        expand,
      }),
    ),

  getPost: (id: string) =>
    runApi(() => pb.collection(PB_COLLECTIONS.posts).getOne<PostRecord>(id, { $autoCancel: false, expand: 'author' })),

  listImages: (postId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.postImages).getFullList<PostImageRecord>({
        $autoCancel: false,
        filter: `post = "${postId}"`,
      }),
    ),

  listComments: (postId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.comments).getFullList<CommentRecord>({
        $autoCancel: false,
        filter: `post = "${postId}" && status = "published" && deleted = false`,
        expand: 'author',
      }),
    ),

  createPost: ({ title, content, type, imageFiles = [] }: CreatePostParams) =>
    runApi(async () => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      const post = await pb.collection(PB_COLLECTIONS.posts).create<PostRecord>({
        title,
        content,
        type,
        author,
        status: 'published',
        tags: [],
        viewCount: 0,
        commentCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        bookmarkCount: 0,
        deleted: false,
      }, { $autoCancel: false });

      if (imageFiles.length === 0) {
        return post;
      }

      const imageRecords = await Promise.all(
        imageFiles.map((imageFile) => {
          const formData = new FormData();
          formData.append('post', post.id);
          formData.append('image', imageFile.file);
          formData.append('alt', imageFile.alt);
          formData.append('sortOrder', String(imageFile.sortOrder));
          formData.append('isCover', String(imageFile.isCover));

          return pb.collection(PB_COLLECTIONS.postImages).create<PostImageRecord>(formData, { $autoCancel: false });
        }),
      );

      const nextContent = imageRecords.reduce((currentContent, imageRecord, index) => {
        const sourceId = imageFiles[index]?.id;
        const sourceUrl = imageFiles[index]?.url;
        const imageUrl = pb.files.getURL(imageRecord, imageRecord.image);
        const tokenReplacedContent = sourceId
          ? currentContent.replaceAll(`[[image:${sourceId}]]`, `[[image:${imageRecord.id}]]`)
          : currentContent;

        return sourceUrl ? tokenReplacedContent.replaceAll(sourceUrl, imageUrl) : tokenReplacedContent;
      }, content);

      if (nextContent !== content) {
        return pb.collection(PB_COLLECTIONS.posts).update<PostRecord>(post.id, { content: nextContent }, { $autoCancel: false });
      }

      return post;
    }),

  updatePost: ({ postId, title, content }: UpdatePostParams) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.posts).update<PostRecord>(
        postId,
        {
          title,
          content,
        },
        { $autoCancel: false, expand: 'author' },
      ),
    ),

  createComment: ({ postId, content, parentCommentId }: CreateCommentParams) =>
    runApi(async () => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      const post = await pb.collection(PB_COLLECTIONS.posts).getOne<PostRecord>(postId, { $autoCancel: false });

      const comment = await pb.collection(PB_COLLECTIONS.comments).create<CommentRecord>({
        post: postId,
        author,
        content,
        ...(parentCommentId ? { parentComment: parentCommentId } : {}),
        status: 'published',
        likeCount: 0,
        dislikeCount: 0,
        deleted: false,
      }, { $autoCancel: false });

      try {
        await pb.collection(PB_COLLECTIONS.posts).update<PostRecord>(
          postId,
          { commentCount: (post.commentCount ?? 0) + 1 },
          { $autoCancel: false },
        );
      } catch {
        // 댓글 수 집계 갱신은 서버 권한 설정에 따라 실패할 수 있으므로 댓글 등록 성공을 우선합니다.
      }

      return comment;
    }),

  updateComment: ({ commentId, content }: UpdateCommentParams) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.comments).update<CommentRecord>(
        commentId,
        { content },
        { $autoCancel: false, expand: 'author' },
      ),
    ),

  hideComment: (commentId: string) =>
    runApi(async () => {
      const comment = await pb.collection(PB_COLLECTIONS.comments).update<CommentRecord>(
        commentId,
        {
          status: 'hidden',
          deleted: true,
          deletedAt: new Date().toISOString(),
        },
        { $autoCancel: false, expand: 'author' },
      );

      try {
        const post = await pb.collection(PB_COLLECTIONS.posts).getOne<PostRecord>(comment.post, { $autoCancel: false });
        await pb.collection(PB_COLLECTIONS.posts).update<PostRecord>(
          comment.post,
          { commentCount: Math.max(0, (post.commentCount ?? 0) - 1) },
          { $autoCancel: false },
        );
      } catch {
        // 댓글 수 집계 갱신은 서버 권한 설정에 따라 실패할 수 있으므로 댓글 숨김 성공을 우선합니다.
      }

      return comment;
    }),

  hidePost: (postId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.posts).update<PostRecord>(postId, {
        status: 'hidden',
        deleted: true,
        deletedAt: new Date().toISOString(),
      }, { $autoCancel: false, expand: 'author' }),
    ),

  deletePostPermanently: (postId: string) =>
    runApi(async () => {
      const [images, comments] = await Promise.all([
        pb.collection(PB_COLLECTIONS.postImages).getFullList<PostImageRecord>({
          $autoCancel: false,
          filter: `post = "${postId}"`,
        }),
        pb.collection(PB_COLLECTIONS.comments).getFullList<CommentRecord>({
          $autoCancel: false,
          filter: `post = "${postId}"`,
        }),
      ]);

      await Promise.all([
        ...images.map((image) => pb.collection(PB_COLLECTIONS.postImages).delete(image.id, { $autoCancel: false })),
        ...comments.map((comment) => pb.collection(PB_COLLECTIONS.comments).delete(comment.id, { $autoCancel: false })),
      ]);

      return pb.collection(PB_COLLECTIONS.posts).delete(postId, { $autoCancel: false });
    }),

  listMyPosts: () =>
    runApi(() => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(PB_COLLECTIONS.posts).getFullList<PostRecord>({
        $autoCancel: false,
        filter: `author = "${author}" && deleted = false`,
        expand: 'author',
      });
    }),

  listMyComments: () =>
    runApi(() => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(PB_COLLECTIONS.comments).getFullList<CommentRecord>({
        $autoCancel: false,
        filter: `author = "${author}" && deleted = false`,
        expand: 'author',
      });
    }),

  getImageUrl: (image: PostImageRecord) => pb.files.getURL(image, image.image),
};
