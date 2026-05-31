import { pb } from '@/lib/pocketBase';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import type { ContentSettingRecord, ContentSettingKey, UpdatePayload } from '@/types/domain';
import { runApi } from '../apiClient';

export const contentSettingApi = {
  list: () =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.contentSettings).getFullList<ContentSettingRecord>({
        $autoCancel: false,
        sort: 'group,label',
      }),
    ),

  getByKey: (contentKey: ContentSettingKey | string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.contentSettings).getFirstListItem<ContentSettingRecord>(
        `contentKey="${contentKey}"`,
        { $autoCancel: false },
      ),
    ),

  update: (id: string, payload: UpdatePayload) =>
    runApi(() => pb.collection(PB_COLLECTIONS.contentSettings).update<ContentSettingRecord>(id, payload, { $autoCancel: false })),
};
