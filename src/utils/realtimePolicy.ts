import type { RecordSubscription } from 'pocketbase';
import { pb } from '@/lib/pocketBase';

export type RealtimeHandler = (event: RecordSubscription<unknown>) => void;

export const subscribeCollection = async (collectionName: string, handler: RealtimeHandler) => {
  await pb.collection(collectionName).subscribe('*', handler);

  return () => {
    pb.collection(collectionName).unsubscribe('*');
  };
};
