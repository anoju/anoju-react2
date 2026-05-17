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
}

export interface CreatePostParams {
  title: string;
  content: string;
  type: PostType;
  imageFiles?: Array<{
    id: string;
    file: File;
    alt: string;
    sortOrder: number;
    isCover: boolean;
  }>;
}

export interface CreateCommentParams {
  postId: string;
  content: string;
}

export const communityApi = {
  listPosts: ({ type, page = 1, perPage = 20, filter }: PostListParams) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.posts).getList<PostRecord>(page, perPage, {
        $autoCancel: false,
        filter: getPublishedFilter(type, filter),
      }),
    ),

  getPost: (id: string) =>
    runApi(() => pb.collection(PB_COLLECTIONS.posts).getOne<PostRecord>(id, { $autoCancel: false })),

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
        bookmarkCount: 0,
        deleted: false,
      });

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

          return pb.collection(PB_COLLECTIONS.postImages).create<PostImageRecord>(formData);
        }),
      );

      const nextContent = imageRecords.reduce((currentContent, imageRecord, index) => {
        const sourceId = imageFiles[index]?.id;
        return sourceId ? currentContent.replaceAll(`[[image:${sourceId}]]`, `[[image:${imageRecord.id}]]`) : currentContent;
      }, content);

      if (nextContent !== content) {
        return pb.collection(PB_COLLECTIONS.posts).update<PostRecord>(post.id, { content: nextContent });
      }

      return post;
    }),

  createComment: ({ postId, content }: CreateCommentParams) =>
    runApi(async () => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(PB_COLLECTIONS.comments).create<CommentRecord>({
        post: postId,
        author,
        content,
        status: 'published',
        likeCount: 0,
        deleted: false,
      });
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
      });
    }),

  getImageUrl: (image: PostImageRecord) => pb.files.getURL(image, image.image),
};
