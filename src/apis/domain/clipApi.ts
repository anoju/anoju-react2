import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { pb } from '@/lib/pocketBase';
import type { ClipRecord, ListParams } from '@/types/domain';
import { runApi } from '../apiClient';

const escapeFilterValue = (value: string) => value.trim().replaceAll('\\', '\\\\').replaceAll('"', '\\"');

const getPublishedFilter = (extraFilter?: string) =>
  ['status = "published"', 'deleted = false', extraFilter ? `(${extraFilter})` : ''].filter(Boolean).join(' && ');

export interface ClipListParams extends ListParams {
  keyword?: string;
  authorId?: string;
}

export interface CreateClipParams {
  title: string;
  description: string;
  videoFile: File;
  videoTrimStart?: number;
  videoTrimEnd?: number;
  posterFile?: File;
}

export interface UpdateClipParams {
  clipId: string;
  title: string;
  description: string;
  posterFile?: File;
}

const createClipFilter = ({ keyword, authorId }: ClipListParams) => {
  const filters: string[] = [];

  if (keyword?.trim()) {
    const value = escapeFilterValue(keyword);
    filters.push(`title ~ "${value}" || description ~ "${value}" || tags ~ "${value}"`);
  }

  if (authorId) {
    filters.push(`author = "${authorId}"`);
  }

  return filters.join(' && ');
};

export const getClipVideoUrl = (clip: ClipRecord) => pb.files.getURL(clip, clip.video);

export const getClipPosterUrl = (clip: ClipRecord) => (clip.poster ? pb.files.getURL(clip, clip.poster) : undefined);

export const clipApi = {
  listClips: ({ page = 1, perPage = 12, filter, keyword, authorId, sort = '-created', expand = 'author' }: ClipListParams) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.clips).getList<ClipRecord>(page, perPage, {
        $autoCancel: false,
        filter: getPublishedFilter([filter, createClipFilter({ keyword, authorId })].filter(Boolean).join(' && ')),
        sort,
        expand,
      }),
    ),

  getClip: (clipId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.clips).getOne<ClipRecord>(clipId, {
        $autoCancel: false,
        expand: 'author',
      }),
    ),

  createClip: ({ title, description, videoFile, videoTrimStart, videoTrimEnd, posterFile }: CreateClipParams) =>
    runApi(() => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('author', author);
      formData.append('status', 'published');
      formData.append('tags', JSON.stringify([]));
      formData.append('viewCount', '0');
      formData.append('likeCount', '0');
      formData.append('dislikeCount', '0');
      formData.append('deleted', 'false');
      formData.append('video', videoFile);

      if (videoTrimStart !== undefined) {
        formData.append('videoTrimStart', String(videoTrimStart));
      }

      if (videoTrimEnd !== undefined) {
        formData.append('videoTrimEnd', String(videoTrimEnd));
      }

      if (posterFile) {
        formData.append('poster', posterFile);
      }

      return pb.collection(PB_COLLECTIONS.clips).create<ClipRecord>(formData, {
        $autoCancel: false,
        expand: 'author',
      });
    }),

  updateClip: ({ clipId, title, description, posterFile }: UpdateClipParams) =>
    runApi(() => {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      if (posterFile) {
        formData.append('poster', posterFile);
      }

      return pb.collection(PB_COLLECTIONS.clips).update<ClipRecord>(clipId, formData, {
        $autoCancel: false,
        expand: 'author',
      });
    }),

  hideClip: (clipId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.clips).update<ClipRecord>(
        clipId,
        {
          status: 'hidden',
          deleted: true,
          deletedAt: new Date().toISOString(),
        },
        { $autoCancel: false, expand: 'author' },
      ),
    ),

  deleteClipPermanently: (clipId: string) =>
    runApi(() => pb.collection(PB_COLLECTIONS.clips).delete(clipId, { $autoCancel: false })),

  listMyClips: () =>
    runApi(() => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(PB_COLLECTIONS.clips).getFullList<ClipRecord>({
        $autoCancel: false,
        filter: `author = "${author}" && deleted = false`,
        expand: 'author',
      });
    }),
};
