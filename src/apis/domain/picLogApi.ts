import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { pb } from '@/lib/pocketBase';
import type {
  PicLogCommentRecord,
  PicLogEntryRecord,
  PicLogOrderRequestRecord,
  PicLogRecord,
  PicLogVisibility,
} from '@/types/domain';
import { runApi } from '../apiClient';

interface CreatePicLogParams {
  title: string;
  logDate: string;
  visibility: PicLogVisibility;
}

interface CreatePicLogEntryParams {
  logId: string;
  logDate: string;
  chapter: string;
  imageFile: File;
  alt: string;
  memo: string;
}

interface UpdatePicLogEntryParams {
  entryId: string;
  chapter: string;
  alt: string;
  memo: string;
  imageFile?: File;
}

interface CreatePicLogCommentParams {
  logId: string;
  chapter: string;
  content: string;
  taggedUserId?: string;
}

interface CreateOrderRequestParams {
  logId: string;
  targetUserId: string;
}

const getCurrentUserId = () => {
  const userId = pb.authStore.model?.id;

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  return userId;
};

export const picLogApi = {
  listLogs: (filter?: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.picLogs).getFullList<PicLogRecord>({
        $autoCancel: false,
        filter: ['status = "published"', 'deleted = false', filter ? `(${filter})` : ''].filter(Boolean).join(' && '),
        sort: '-logDate',
        expand: 'participants,author',
      }),
    ),

  getLog: (logId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.picLogs).getOne<PicLogRecord>(logId, {
        $autoCancel: false,
        expand: 'participants,author',
      }),
    ),

  listEntries: (logId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.picLogEntries).getFullList<PicLogEntryRecord>({
        $autoCancel: false,
        filter: `log = "${logId}" && deleted = false`,
        sort: 'logDate,chapter',
        expand: 'author',
      }),
    ),

  getEntry: (entryId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.picLogEntries).getOne<PicLogEntryRecord>(entryId, {
        $autoCancel: false,
        expand: 'author,log',
      }),
    ),

  listComments: (logId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.picLogComments).getFullList<PicLogCommentRecord>({
        $autoCancel: false,
        filter: `log = "${logId}" && status = "published" && deleted = false`,
        sort: 'chapter',
        expand: 'author,taggedUser',
      }),
    ),

  listOrderRequests: (logId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.picLogOrderRequests).getFullList<PicLogOrderRequestRecord>({
        $autoCancel: false,
        filter: `log = "${logId}"`,
        expand: 'requester,targetUser',
      }),
    ),

  createLog: ({ title, logDate, visibility }: CreatePicLogParams) =>
    runApi(() => {
      const author = getCurrentUserId();

      return pb.collection(PB_COLLECTIONS.picLogs).create<PicLogRecord>(
        {
          title,
          logDate,
          author,
          participants: [author],
          participantOrder: [author],
          visibility,
          status: 'published',
          deleted: false,
        },
        { $autoCancel: false, expand: 'participants,author' },
      );
    }),

  createEntry: ({ logId, logDate, chapter, imageFile, alt, memo }: CreatePicLogEntryParams) =>
    runApi(() => {
      const author = getCurrentUserId();
      const formData = new FormData();

      formData.append('log', logId);
      formData.append('author', author);
      formData.append('logDate', logDate);
      formData.append('chapter', chapter);
      formData.append('image', imageFile);
      formData.append('alt', alt);
      formData.append('memo', memo);
      formData.append('deleted', 'false');

      return pb.collection(PB_COLLECTIONS.picLogEntries).create<PicLogEntryRecord>(formData, {
        $autoCancel: false,
        expand: 'author',
      });
    }),

  updateEntry: ({ entryId, chapter, alt, memo, imageFile }: UpdatePicLogEntryParams) =>
    runApi(() => {
      const formData = new FormData();

      formData.append('chapter', chapter);
      formData.append('alt', alt);
      formData.append('memo', memo);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      return pb.collection(PB_COLLECTIONS.picLogEntries).update<PicLogEntryRecord>(entryId, formData, {
        $autoCancel: false,
        expand: 'author',
      });
    }),

  createComment: ({ logId, chapter, content, taggedUserId }: CreatePicLogCommentParams) =>
    runApi(() => {
      const author = getCurrentUserId();

      return pb.collection(PB_COLLECTIONS.picLogComments).create<PicLogCommentRecord>(
        {
          log: logId,
          chapter,
          author,
          content,
          ...(taggedUserId ? { taggedUser: taggedUserId } : {}),
          status: 'published',
          deleted: false,
        },
        { $autoCancel: false, expand: 'author,taggedUser' },
      );
    }),

  createOrderRequest: ({ logId, targetUserId }: CreateOrderRequestParams) =>
    runApi(() => {
      const requester = getCurrentUserId();

      return pb.collection(PB_COLLECTIONS.picLogOrderRequests).create<PicLogOrderRequestRecord>(
        {
          log: logId,
          requester,
          targetUser: targetUserId,
          status: 'pending',
        },
        { $autoCancel: false, expand: 'requester,targetUser' },
      );
    }),

  respondOrderRequest: async (request: PicLogOrderRequestRecord, accepted: boolean) =>
    runApi(async () => {
      const [log] = await Promise.all([
        pb.collection(PB_COLLECTIONS.picLogs).getOne<PicLogRecord>(request.log, { $autoCancel: false }),
        pb.collection(PB_COLLECTIONS.picLogOrderRequests).update<PicLogOrderRequestRecord>(
          request.id,
          { status: accepted ? 'accepted' : 'rejected' },
          { $autoCancel: false },
        ),
      ]);

      if (!accepted) {
        return log;
      }

      const nextOrder = Array.isArray(log.participantOrder) ? [...log.participantOrder] : [...log.participants];
      const requesterIndex = nextOrder.indexOf(request.requester);
      const targetIndex = nextOrder.indexOf(request.targetUser);

      if (requesterIndex >= 0 && targetIndex >= 0) {
        [nextOrder[requesterIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[requesterIndex]];
      }

      return pb.collection(PB_COLLECTIONS.picLogs).update<PicLogRecord>(
        log.id,
        { participantOrder: nextOrder },
        { $autoCancel: false, expand: 'participants,author' },
      );
    }),
};
